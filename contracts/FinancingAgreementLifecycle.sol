// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title FinancingAgreementLifecycle
 * @notice Manages active financing agreements, repayment schedules, and debt accounting on Base Sepolia.
 */
contract FinancingAgreementLifecycle {
    using SafeERC20 for IERC20;

    enum AgreementStatus { Active, Repaid, InDefault }

    struct RepaymentRecord {
        uint256 paymentId;
        uint256 amount;
        uint64 timestamp;
        address payer;
        bool isTokenTransfer; // Distinguishes contract-settled token transfer vs validated offchain proof
    }

    struct Agreement {
        uint256 agreementId;
        uint256 offerId;
        uint256 requestId;
        address merchant;
        address lender;
        uint256 principalAmount;
        uint16 interestAprBps;
        uint256 totalRepayable;
        uint256 totalRepaid;
        uint16 durationMonths;
        uint16 installmentsTotal;
        uint16 installmentsPaid;
        uint256 installmentAmount;
        uint64 createdAt;
        uint64 nextDueTimestamp;
        AgreementStatus status;
        address settlementToken; // address(0) for native / demo tracking, or ERC20 test token
    }

    uint256 public nextAgreementId = 1;
    uint256 public nextPaymentId = 1;

    // AgreementId => Agreement
    mapping(uint256 => Agreement) public agreements;
    // AgreementId => list of repayment records
    mapping(uint256 => RepaymentRecord[]) private _agreementRepayments;
    // Merchant => list of agreement IDs
    mapping(address => uint256[]) private _merchantAgreements;
    // Lender => list of agreement IDs
    mapping(address => uint256[]) private _lenderAgreements;

    address public marketplace;
    address public owner;

    event AgreementCreated(
        uint256 indexed agreementId,
        uint256 indexed offerId,
        address indexed merchant,
        address lender,
        uint256 principal,
        uint256 totalRepayable
    );

    event RepaymentRecorded(
        uint256 indexed agreementId,
        uint256 indexed paymentId,
        address indexed payer,
        uint256 amount,
        uint256 remainingBalance,
        bool isTokenTransfer
    );

    event AgreementCompleted(uint256 indexed agreementId, address indexed merchant);

    modifier onlyAuthorized() {
        require(msg.sender == marketplace || msg.sender == owner, "Unauthorized caller");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setMarketplace(address _marketplace) external {
        require(msg.sender == owner, "Only owner");
        require(_marketplace != address(0), "Invalid address");
        marketplace = _marketplace;
    }

    /**
     * @notice Creates an agreement from an accepted offer
     */
    function createAgreement(
        uint256 offerId,
        uint256 requestId,
        address merchant,
        address lender,
        uint256 principal,
        uint16 interestAprBps,
        uint16 durationMonths,
        address settlementToken
    ) external onlyAuthorized returns (uint256 agreementId) {
        require(merchant != address(0) && lender != address(0), "Invalid parties");
        require(principal > 0, "Principal must be > 0");
        require(durationMonths > 0, "Duration must be > 0");

        // Simple interest total = principal * (1 + (aprBps * durationMonths) / (10000 * 12))
        uint256 totalInterest = (principal * interestAprBps * durationMonths) / (10000 * 12);
        uint256 totalRepayable = principal + totalInterest;
        uint256 installmentAmount = totalRepayable / durationMonths;

        agreementId = nextAgreementId++;
        uint64 nowSec = uint64(block.timestamp);
        uint64 firstDue = nowSec + 30 days;

        Agreement storage ag = agreements[agreementId];
        ag.agreementId = agreementId;
        ag.offerId = offerId;
        ag.requestId = requestId;
        ag.merchant = merchant;
        ag.lender = lender;
        ag.principalAmount = principal;
        ag.interestAprBps = interestAprBps;
        ag.totalRepayable = totalRepayable;
        ag.totalRepaid = 0;
        ag.durationMonths = durationMonths;
        ag.installmentsTotal = durationMonths;
        ag.installmentsPaid = 0;
        ag.installmentAmount = installmentAmount;
        ag.createdAt = nowSec;
        ag.nextDueTimestamp = firstDue;
        ag.status = AgreementStatus.Active;
        ag.settlementToken = settlementToken;

        _merchantAgreements[merchant].push(agreementId);
        _lenderAgreements[lender].push(agreementId);

        emit AgreementCreated(agreementId, offerId, merchant, lender, principal, totalRepayable);
    }

    /**
     * @notice Executes a repayment using an ERC20 token
     */
    function makeTokenRepayment(uint256 agreementId, uint256 amount) external {
        Agreement storage ag = agreements[agreementId];
        require(ag.agreementId != 0, "Agreement not found");
        require(ag.status == AgreementStatus.Active, "Agreement not active");
        require(amount > 0, "Amount must be > 0");
        require(ag.settlementToken != address(0), "Not configured for token payment");

        uint256 remaining = ag.totalRepayable - ag.totalRepaid;
        require(amount <= remaining, "Amount exceeds outstanding balance");

        IERC20(ag.settlementToken).safeTransferFrom(msg.sender, ag.lender, amount);

        _processRepayment(ag, amount, true);
    }

    /**
     * @notice Records a repayment transaction (for native test transfers, demo mode, or verified settlement)
     */
    function recordRepayment(uint256 agreementId, uint256 amount) external {
        Agreement storage ag = agreements[agreementId];
        require(ag.agreementId != 0, "Agreement not found");
        require(ag.status == AgreementStatus.Active, "Agreement not active");
        require(msg.sender == ag.merchant || msg.sender == ag.lender || msg.sender == owner, "Unauthorized");
        require(amount > 0, "Amount must be > 0");

        uint256 remaining = ag.totalRepayable - ag.totalRepaid;
        require(amount <= remaining, "Amount exceeds outstanding balance");

        _processRepayment(ag, amount, false);
    }

    function _processRepayment(Agreement storage ag, uint256 amount, bool isTokenTransfer) internal {
        ag.totalRepaid += amount;
        ag.installmentsPaid = uint16((ag.totalRepaid * ag.installmentsTotal) / ag.totalRepayable);

        uint256 paymentId = nextPaymentId++;
        _agreementRepayments[ag.agreementId].push(RepaymentRecord({
            paymentId: paymentId,
            amount: amount,
            timestamp: uint64(block.timestamp),
            payer: msg.sender,
            isTokenTransfer: isTokenTransfer
        }));

        uint256 remainingBalance = ag.totalRepayable - ag.totalRepaid;

        // Advance next due date if another installment is due
        if (remainingBalance > 0) {
            ag.nextDueTimestamp = uint64(block.timestamp) + 30 days;
        } else {
            ag.status = AgreementStatus.Repaid;
            emit AgreementCompleted(ag.agreementId, ag.merchant);
        }

        emit RepaymentRecorded(
            ag.agreementId,
            paymentId,
            msg.sender,
            amount,
            remainingBalance,
            isTokenTransfer
        );
    }

    function getRepayments(uint256 agreementId) external view returns (RepaymentRecord[] memory) {
        return _agreementRepayments[agreementId];
    }

    function getMerchantAgreements(address merchant) external view returns (uint256[] memory) {
        return _merchantAgreements[merchant];
    }

    function getLenderAgreements(address lender) external view returns (uint256[] memory) {
        return _lenderAgreements[lender];
    }
}
