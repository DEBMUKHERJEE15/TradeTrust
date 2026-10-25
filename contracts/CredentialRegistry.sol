// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CredentialRegistry
 * @notice Onchain anchor for privacy-preserving business credentials on Base Sepolia.
 * Stores commitments and cryptographic hashes without exposing PII or raw financial statements.
 */
contract CredentialRegistry {
    enum CredentialType {
        REVENUE_THRESHOLD,
        BUSINESS_REGISTRATION,
        TAX_COMPLIANCE,
        SUPPLIER_INVOICE,
        BANKING_ACTIVITY
    }

    struct Credential {
        bytes32 commitmentHash;
        address merchant;
        address issuer;
        CredentialType credType;
        uint64 issuedAt;
        uint64 expiresAt;
        bool isRevoked;
        string schemaUri; // Offchain schema reference or IPFS cid
    }

    // Hash => Credential
    mapping(bytes32 => Credential) public credentials;
    // Merchant => List of credential hashes
    mapping(address => bytes32[]) private _merchantCredentials;
    // Authorized issuers
    mapping(address => bool) public authorizedIssuers;
    
    address public owner;

    event CredentialRegistered(
        bytes32 indexed commitmentHash,
        address indexed merchant,
        address indexed issuer,
        CredentialType credType,
        uint64 expiresAt
    );

    event CredentialRevoked(
        bytes32 indexed commitmentHash,
        address indexed merchant,
        address indexed issuer,
        uint64 revokedAt
    );

    event IssuerStatusUpdated(address indexed issuer, bool isAuthorized);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only registry owner");
        _;
    }

    modifier onlyIssuer() {
        require(authorizedIssuers[msg.sender] || msg.sender == owner, "Unauthorized issuer");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
    }

    function setIssuerStatus(address issuer, bool isAuthorized) external onlyOwner {
        require(issuer != address(0), "Invalid address");
        authorizedIssuers[issuer] = isAuthorized;
        emit IssuerStatusUpdated(issuer, isAuthorized);
    }

    function registerCredential(
        bytes32 commitmentHash,
        address merchant,
        CredentialType credType,
        uint64 validDurationSeconds,
        string calldata schemaUri
    ) external onlyIssuer {
        require(commitmentHash != bytes32(0), "Invalid commitment hash");
        require(merchant != address(0), "Invalid merchant address");
        require(credentials[commitmentHash].issuedAt == 0, "Credential already exists");

        uint64 nowSec = uint64(block.timestamp);
        uint64 expires = nowSec + validDurationSeconds;

        credentials[commitmentHash] = Credential({
            commitmentHash: commitmentHash,
            merchant: merchant,
            issuer: msg.sender,
            credType: credType,
            issuedAt: nowSec,
            expiresAt: expires,
            isRevoked: false,
            schemaUri: schemaUri
        });

        _merchantCredentials[merchant].push(commitmentHash);

        emit CredentialRegistered(commitmentHash, merchant, msg.sender, credType, expires);
    }

    function revokeCredential(bytes32 commitmentHash) external {
        Credential storage cred = credentials[commitmentHash];
        require(cred.issuedAt > 0, "Credential not found");
        require(msg.sender == cred.issuer || msg.sender == owner, "Only issuer or owner can revoke");
        require(!cred.isRevoked, "Already revoked");

        cred.isRevoked = true;
        emit CredentialRevoked(commitmentHash, cred.merchant, msg.sender, uint64(block.timestamp));
    }

    function isValid(bytes32 commitmentHash) external view returns (bool) {
        Credential memory cred = credentials[commitmentHash];
        if (cred.issuedAt == 0) return false;
        if (cred.isRevoked) return false;
        if (block.timestamp > cred.expiresAt) return false;
        return true;
    }

    function getMerchantCredentials(address merchant) external view returns (bytes32[] memory) {
        return _merchantCredentials[merchant];
    }
}
