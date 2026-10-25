// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SpendingAuthorization
 * @notice Scoped, programmable authorization for AI agent commerce on Base Sepolia.
 * Prevents an AI agent from having unrestricted wallet access or exceeding merchant-approved limits.
 */
contract SpendingAuthorization {
    struct Authorization {
        address agent;
        uint256 cumulativeLimit;
        uint256 spentAmount;
        uint256 perTransactionLimit;
        uint64 expiresAt;
        bytes32 categoryHash; // Hash of allowed category or approved supplier ID
        bool isActive;
    }

    // Merchant => Agent => Authorization
    mapping(address => mapping(address => Authorization)) public authorizations;
    
    // Nonce to prevent duplicate execution hashes
    mapping(bytes32 => bool) public executedOrders;

    event AgentAuthorized(
        address indexed merchant,
        address indexed agent,
        uint256 cumulativeLimit,
        uint256 perTransactionLimit,
        uint64 expiresAt,
        bytes32 categoryHash
    );

    event AuthorizationRevoked(
        address indexed merchant,
        address indexed agent
    );

    event SpendRecorded(
        address indexed merchant,
        address indexed agent,
        uint256 amount,
        bytes32 orderHash,
        uint256 remainingLimit
    );

    /**
     * @notice Authorizes an AI agent with explicit financial bounds
     */
    function authorizeAgent(
        address agent,
        uint256 cumulativeLimit,
        uint256 perTransactionLimit,
        uint64 durationSeconds,
        bytes32 categoryHash
    ) external {
        require(agent != address(0), "Invalid agent address");
        require(cumulativeLimit > 0, "Limit must be > 0");
        require(perTransactionLimit > 0 && perTransactionLimit <= cumulativeLimit, "Invalid per-tx limit");
        require(durationSeconds >= 60, "Duration must be at least 60s");

        uint64 expiresAt = uint64(block.timestamp) + durationSeconds;

        authorizations[msg.sender][agent] = Authorization({
            agent: agent,
            cumulativeLimit: cumulativeLimit,
            spentAmount: 0,
            perTransactionLimit: perTransactionLimit,
            expiresAt: expiresAt,
            categoryHash: categoryHash,
            isActive: true
        });

        emit AgentAuthorized(msg.sender, agent, cumulativeLimit, perTransactionLimit, expiresAt, categoryHash);
    }

    /**
     * @notice Revokes an agent's spending authorization immediately
     */
    function revokeAuthorization(address agent) external {
        Authorization storage auth = authorizations[msg.sender][agent];
        require(auth.isActive, "Authorization not active");
        auth.isActive = false;
        emit AuthorizationRevoked(msg.sender, agent);
    }

    /**
     * @notice Records an approved spend executed by an authorized agent
     */
    function recordAuthorizedSpend(
        address merchant,
        uint256 amount,
        bytes32 orderHash,
        bytes32 categoryHash
    ) external returns (uint256 remaining) {
        require(merchant != address(0), "Invalid merchant address");
        require(amount > 0, "Amount must be > 0");
        require(orderHash != bytes32(0), "Invalid order hash");
        require(!executedOrders[orderHash], "Order already executed");

        Authorization storage auth = authorizations[merchant][msg.sender];
        require(auth.isActive, "Agent not authorized or revoked");
        require(block.timestamp <= auth.expiresAt, "Authorization expired");
        require(amount <= auth.perTransactionLimit, "Exceeds per-tx limit");
        require(auth.spentAmount + amount <= auth.cumulativeLimit, "Exceeds cumulative limit");

        if (auth.categoryHash != bytes32(0)) {
            require(categoryHash == auth.categoryHash, "Category hash mismatch");
        }

        auth.spentAmount += amount;
        executedOrders[orderHash] = true;
        remaining = auth.cumulativeLimit - auth.spentAmount;

        emit SpendRecorded(merchant, msg.sender, amount, orderHash, remaining);
    }

    /**
     * @notice Returns remaining allowance and authorization validity
     */
    function getAuthorizationStatus(address merchant, address agent) external view returns (
        bool isValid,
        uint256 remainingLimit,
        uint256 perTxLimit,
        uint64 expiresAt
    ) {
        Authorization memory auth = authorizations[merchant][agent];
        if (!auth.isActive || block.timestamp > auth.expiresAt || auth.spentAmount >= auth.cumulativeLimit) {
            return (false, 0, 0, auth.expiresAt);
        }
        return (true, auth.cumulativeLimit - auth.spentAmount, auth.perTransactionLimit, auth.expiresAt);
    }
}
