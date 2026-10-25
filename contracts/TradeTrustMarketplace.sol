// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TradeTrustMarketplace
 * @notice Onchain financing marketplace for Base Sepolia.
 * Connects small merchants with lender working-capital offers while enforcing strict access control.
 */
contract TradeTrustMarketplace {
    enum RequestStatus { Open, OffersReceived, Accepted, Cancelled, Expired }
    enum OfferStatus { Active, Accepted, Rejected, Expired, Cancelled }

    struct FinancingRequest {
        uint256 requestId;
        address merchant;
        uint256 amountRequested;
        string purpose;
        uint16 durationMonths;
        uint16 maxAprBps; // 100 bps = 1%
        bytes32 evidenceCommitment; // Privacy commitment of business metrics
        RequestStatus status;
        uint64 createdAt;
        uint64 expiresAt;
    }

    struct LenderOffer {
        uint256 offerId;
        uint256 requestId;
        address lender;
        uint256 amountOffered;
        uint16 interestAprBps;
        uint16 durationMonths;
        uint8 repaymentFrequency; // 1 = Monthly, 2 = Bi-weekly, 3 = Weekly
        OfferStatus status;
        uint64 createdAt;
        uint64 expiresAt;
    }

    uint256 public nextRequestId = 1;
    uint256 public nextOfferId = 1;

    // RequestId => Request
    mapping(uint256 => FinancingRequest) public requests;
    // OfferId => Offer
    mapping(uint256 => LenderOffer) public offers;

    // RequestId => list of offer IDs
    mapping(uint256 => uint256[]) private _requestOffers;
    // Merchant => list of request IDs
    mapping(address => uint256[]) private _merchantRequests;
    // Lender => list of offer IDs
    mapping(address => uint256[]) private _lenderOffers;

    address public lifecycleContract;
    address public owner;

    event FinancingRequestCreated(
        uint256 indexed requestId,
        address indexed merchant,
        uint256 amountRequested,
        string purpose,
        uint16 durationMonths,
        bytes32 evidenceCommitment
    );

    event LenderOfferCreated(
        uint256 indexed offerId,
        uint256 indexed requestId,
        address indexed lender,
        uint256 amountOffered,
        uint16 interestAprBps,
        uint64 expiresAt
    );

    event OfferAccepted(
        uint256 indexed offerId,
        uint256 indexed requestId,
        address indexed merchant,
        address lender,
        uint256 amount
    );

    event OfferRejected(uint256 indexed offerId, uint256 indexed requestId, address indexed merchant);
    event RequestCancelled(uint256 indexed requestId, address indexed merchant);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setLifecycleContract(address _lifecycleContract) external onlyOwner {
        require(_lifecycleContract != address(0), "Invalid address");
        lifecycleContract = _lifecycleContract;
    }

    function createFinancingRequest(
        uint256 amountRequested,
        string calldata purpose,
        uint16 durationMonths,
        uint16 maxAprBps,
        bytes32 evidenceCommitment,
        uint64 durationDays
    ) external returns (uint256 requestId) {
        require(amountRequested > 0, "Amount must be > 0");
        require(durationMonths > 0 && durationMonths <= 60, "Invalid duration (1-60 mo)");
        require(durationDays >= 1 && durationDays <= 90, "Invalid expiry duration");

        requestId = nextRequestId++;
        uint64 nowSec = uint64(block.timestamp);
        uint64 expiresAt = nowSec + (durationDays * 1 days);

        requests[requestId] = FinancingRequest({
            requestId: requestId,
            merchant: msg.sender,
            amountRequested: amountRequested,
            purpose: purpose,
            durationMonths: durationMonths,
            maxAprBps: maxAprBps,
            evidenceCommitment: evidenceCommitment,
            status: RequestStatus.Open,
            createdAt: nowSec,
            expiresAt: expiresAt
        });

        _merchantRequests[msg.sender].push(requestId);

        emit FinancingRequestCreated(
            requestId,
            msg.sender,
            amountRequested,
            purpose,
            durationMonths,
            evidenceCommitment
        );
    }

    function createLenderOffer(
        uint256 requestId,
        uint256 amountOffered,
        uint16 interestAprBps,
        uint16 durationMonths,
        uint8 repaymentFrequency,
        uint64 validDays
    ) external returns (uint256 offerId) {
        FinancingRequest storage req = requests[requestId];
        require(req.requestId != 0, "Request does not exist");
        require(req.status == RequestStatus.Open || req.status == RequestStatus.OffersReceived, "Request not accepting offers");
        require(block.timestamp <= req.expiresAt, "Request has expired");
        require(msg.sender != req.merchant, "Merchant cannot fund own request");
        require(amountOffered > 0, "Offer amount must be > 0");
        require(interestAprBps > 0 && interestAprBps <= 5000, "Invalid APR (max 50%)");
        require(validDays >= 1 && validDays <= 30, "Offer validity 1-30 days");

        offerId = nextOfferId++;
        uint64 nowSec = uint64(block.timestamp);
        uint64 expiresAt = nowSec + (validDays * 1 days);

        offers[offerId] = LenderOffer({
            offerId: offerId,
            requestId: requestId,
            lender: msg.sender,
            amountOffered: amountOffered,
            interestAprBps: interestAprBps,
            durationMonths: durationMonths,
            repaymentFrequency: repaymentFrequency,
            status: OfferStatus.Active,
            createdAt: nowSec,
            expiresAt: expiresAt
        });

        _requestOffers[requestId].push(offerId);
        _lenderOffers[msg.sender].push(offerId);

        if (req.status == RequestStatus.Open) {
            req.status = RequestStatus.OffersReceived;
        }

        emit LenderOfferCreated(offerId, requestId, msg.sender, amountOffered, interestAprBps, expiresAt);
    }

    function acceptOffer(uint256 offerId) external returns (bool) {
        LenderOffer storage off = offers[offerId];
        require(off.offerId != 0, "Offer does not exist");
        require(off.status == OfferStatus.Active, "Offer not active");
        require(block.timestamp <= off.expiresAt, "Offer expired");

        FinancingRequest storage req = requests[off.requestId];
        require(msg.sender == req.merchant, "Only requesting merchant can accept");
        require(req.status == RequestStatus.Open || req.status == RequestStatus.OffersReceived, "Request not in open state");

        off.status = OfferStatus.Accepted;
        req.status = RequestStatus.Accepted;

        // Automatically reject all other offers for this request
        uint256[] storage otherOffers = _requestOffers[off.requestId];
        for (uint256 i = 0; i < otherOffers.length; i++) {
            uint256 otherId = otherOffers[i];
            if (otherId != offerId && offers[otherId].status == OfferStatus.Active) {
                offers[otherId].status = OfferStatus.Rejected;
                emit OfferRejected(otherId, off.requestId, msg.sender);
            }
        }

        emit OfferAccepted(offerId, off.requestId, req.merchant, off.lender, off.amountOffered);
        return true;
    }

    function rejectOffer(uint256 offerId) external {
        LenderOffer storage off = offers[offerId];
        require(off.offerId != 0, "Offer does not exist");
        require(off.status == OfferStatus.Active, "Offer not active");

        FinancingRequest storage req = requests[off.requestId];
        require(msg.sender == req.merchant, "Only requesting merchant can reject");

        off.status = OfferStatus.Rejected;
        emit OfferRejected(offerId, off.requestId, msg.sender);
    }

    function cancelRequest(uint256 requestId) external {
        FinancingRequest storage req = requests[requestId];
        require(req.requestId != 0, "Request does not exist");
        require(msg.sender == req.merchant, "Only creator can cancel");
        require(req.status == RequestStatus.Open || req.status == RequestStatus.OffersReceived, "Cannot cancel accepted request");

        req.status = RequestStatus.Cancelled;

        // Cancel all pending offers
        uint256[] storage reqOffers = _requestOffers[requestId];
        for (uint256 i = 0; i < reqOffers.length; i++) {
            uint256 offId = reqOffers[i];
            if (offers[offId].status == OfferStatus.Active) {
                offers[offId].status = OfferStatus.Cancelled;
            }
        }

        emit RequestCancelled(requestId, msg.sender);
    }

    // View Getters
    function getOffersForRequest(uint256 requestId) external view returns (uint256[] memory) {
        return _requestOffers[requestId];
    }

    function getMerchantRequests(address merchant) external view returns (uint256[] memory) {
        return _merchantRequests[merchant];
    }

    function getLenderOffers(address lender) external view returns (uint256[] memory) {
        return _lenderOffers[lender];
    }
}
