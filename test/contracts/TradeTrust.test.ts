import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("TradeTrust Smart Contract Suite (Base Sepolia Architecture)", function () {
  let marketplace: any;
  let lifecycle: any;
  let credentialRegistry: any;
  let spendingAuth: any;
  let zkVerifier: any;

  let owner: any;
  let merchant: any;
  let lender1: any;
  let lender2: any;
  let agent: any;
  let attacker: any;

  beforeEach(async function () {
    [owner, merchant, lender1, lender2, agent, attacker] = await ethers.getSigners();

    // 1. Deploy CredentialRegistry
    const CredentialRegistryFactory = await ethers.getContractFactory("CredentialRegistry");
    credentialRegistry = await CredentialRegistryFactory.deploy();
    await credentialRegistry.waitForDeployment();

    // 2. Deploy SpendingAuthorization
    const SpendingAuthFactory = await ethers.getContractFactory("SpendingAuthorization");
    spendingAuth = await SpendingAuthFactory.deploy();
    await spendingAuth.waitForDeployment();

    // 3. Deploy ZKRevenueVerifier
    const ZKVerifierFactory = await ethers.getContractFactory("ZKRevenueVerifier");
    zkVerifier = await ZKVerifierFactory.deploy();
    await zkVerifier.waitForDeployment();

    // 4. Deploy Marketplace
    const MarketplaceFactory = await ethers.getContractFactory("TradeTrustMarketplace");
    marketplace = await MarketplaceFactory.deploy();
    await marketplace.waitForDeployment();

    // 5. Deploy Lifecycle
    const LifecycleFactory = await ethers.getContractFactory("FinancingAgreementLifecycle");
    lifecycle = await LifecycleFactory.deploy();
    await lifecycle.waitForDeployment();

    // Link lifecycle and marketplace
    await marketplace.setLifecycleContract(await lifecycle.getAddress());
    await lifecycle.setMarketplace(await marketplace.getAddress());
  });

  describe("1. CredentialRegistry", function () {
    it("allows authorized issuer to register credentials and validates correctly", async function () {
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("merchant-verified-revenue-50000"));
      const durationSeconds = 30 * 24 * 3600; // 30 days

      await expect(
        credentialRegistry.connect(owner).registerCredential(
          commitment,
          merchant.address,
          0, // REVENUE_THRESHOLD
          durationSeconds,
          "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
        )
      ).to.emit(credentialRegistry, "CredentialRegistered");

      expect(await credentialRegistry.isValid(commitment)).to.be.true;

      const merchantCreds = await credentialRegistry.getMerchantCredentials(merchant.address);
      expect(merchantCreds.length).to.equal(1);
      expect(merchantCreds[0]).to.equal(commitment);
    });

    it("rejects registration from unauthorized accounts", async function () {
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("fraudulent-claim"));
      await expect(
        credentialRegistry.connect(attacker).registerCredential(
          commitment,
          merchant.address,
          0,
          3600,
          "ipfs://fake"
        )
      ).to.be.revertedWith("Unauthorized issuer");
    });

    it("allows issuer to revoke a credential", async function () {
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("temporary-claim"));
      await credentialRegistry.connect(owner).registerCredential(
        commitment,
        merchant.address,
        1, // BUSINESS_REGISTRATION
        3600,
        ""
      );

      expect(await credentialRegistry.isValid(commitment)).to.be.true;

      await expect(credentialRegistry.connect(owner).revokeCredential(commitment))
        .to.emit(credentialRegistry, "CredentialRevoked");

      expect(await credentialRegistry.isValid(commitment)).to.be.false;
    });
  });

  describe("2. SpendingAuthorization (Agentic Commerce)", function () {
    const cumulativeLimit = ethers.parseEther("500");
    const perTxLimit = ethers.parseEther("100");
    const duration = 3600; // 1 hour
    const categoryHash = ethers.keccak256(ethers.toUtf8Bytes("INVENTORY_SUPPLIES"));

    beforeEach(async function () {
      await spendingAuth.connect(merchant).authorizeAgent(
        agent.address,
        cumulativeLimit,
        perTxLimit,
        duration,
        categoryHash
      );
    });

    it("authorizes an agent with strict parameters", async function () {
      const [isValid, remaining, txLimit] = await spendingAuth.getAuthorizationStatus(
        merchant.address,
        agent.address
      );
      expect(isValid).to.be.true;
      expect(remaining).to.equal(cumulativeLimit);
      expect(txLimit).to.equal(perTxLimit);
    });

    it("executes spend within limits and updates remaining allowance", async function () {
      const orderHash = ethers.keccak256(ethers.toUtf8Bytes("order-001"));
      const spendAmount = ethers.parseEther("75");

      await expect(
        spendingAuth.connect(agent).recordAuthorizedSpend(
          merchant.address,
          spendAmount,
          orderHash,
          categoryHash
        )
      )
        .to.emit(spendingAuth, "SpendRecorded")
        .withArgs(merchant.address, agent.address, spendAmount, orderHash, cumulativeLimit - spendAmount);

      const [, remaining] = await spendingAuth.getAuthorizationStatus(merchant.address, agent.address);
      expect(remaining).to.equal(cumulativeLimit - spendAmount);
    });

    it("reverts if spend exceeds per-transaction limit", async function () {
      const orderHash = ethers.keccak256(ethers.toUtf8Bytes("order-excess-tx"));
      const excessiveAmount = ethers.parseEther("150"); // perTxLimit is 100

      await expect(
        spendingAuth.connect(agent).recordAuthorizedSpend(
          merchant.address,
          excessiveAmount,
          orderHash,
          categoryHash
        )
      ).to.be.revertedWith("Exceeds per-tx limit");
    });

    it("prevents double execution of the same order hash", async function () {
      const orderHash = ethers.keccak256(ethers.toUtf8Bytes("duplicate-order"));
      const spendAmount = ethers.parseEther("20");

      await spendingAuth.connect(agent).recordAuthorizedSpend(
        merchant.address,
        spendAmount,
        orderHash,
        categoryHash
      );

      await expect(
        spendingAuth.connect(agent).recordAuthorizedSpend(
          merchant.address,
          spendAmount,
          orderHash,
          categoryHash
        )
      ).to.be.revertedWith("Order already executed");
    });

    it("reverts spend after merchant revokes authorization", async function () {
      await spendingAuth.connect(merchant).revokeAuthorization(agent.address);
      const orderHash = ethers.keccak256(ethers.toUtf8Bytes("order-after-revocation"));

      await expect(
        spendingAuth.connect(agent).recordAuthorizedSpend(
          merchant.address,
          ethers.parseEther("10"),
          orderHash,
          categoryHash
        )
      ).to.be.revertedWith("Agent not authorized or revoked");
    });
  });

  describe("3. TradeTrustMarketplace & Lifecycle", function () {
    let reqId: number;
    let offerId1: number;
    let offerId2: number;

    const requestAmount = ethers.parseEther("10000"); // 10,000 USD/tokens
    const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("zk-revenue-proof-commitment"));

    beforeEach(async function () {
      const tx = await marketplace.connect(merchant).createFinancingRequest(
        requestAmount,
        "Working capital for inventory expansion",
        12, // 12 months
        1500, // 15% max APR (1500 bps)
        evidenceHash,
        30 // 30 days expiry
      );
      const receipt = await tx.wait();
      reqId = 1;

      // Lender 1 creates offer
      await marketplace.connect(lender1).createLenderOffer(
        reqId,
        requestAmount,
        1200, // 12% APR
        12,
        1, // Monthly
        14 // 14 days valid
      );
      offerId1 = 1;

      // Lender 2 creates offer
      await marketplace.connect(lender2).createLenderOffer(
        reqId,
        requestAmount,
        1400, // 14% APR
        12,
        1,
        14
      );
      offerId2 = 2;
    });

    it("tracks financing request and received lender offers", async function () {
      const req = await marketplace.requests(reqId);
      expect(req.merchant).to.equal(merchant.address);
      expect(req.amountRequested).to.equal(requestAmount);
      expect(req.status).to.equal(1); // OffersReceived

      const offersForReq = await marketplace.getOffersForRequest(reqId);
      expect(offersForReq.length).to.equal(2);
    });

    it("allows merchant to accept an offer and automatically rejects other offers", async function () {
      await expect(marketplace.connect(merchant).acceptOffer(offerId1))
        .to.emit(marketplace, "OfferAccepted")
        .withArgs(offerId1, reqId, merchant.address, lender1.address, requestAmount)
        .and.to.emit(marketplace, "OfferRejected")
        .withArgs(offerId2, reqId, merchant.address);

      const acceptedOffer = await marketplace.offers(offerId1);
      expect(acceptedOffer.status).to.equal(1); // Accepted

      const rejectedOffer = await marketplace.offers(offerId2);
      expect(rejectedOffer.status).to.equal(2); // Rejected

      const req = await marketplace.requests(reqId);
      expect(req.status).to.equal(2); // Accepted
    });

    it("prevents non-merchant accounts from accepting offers", async function () {
      await expect(
        marketplace.connect(attacker).acceptOffer(offerId1)
      ).to.be.revertedWith("Only requesting merchant can accept");
    });

    it("creates agreement in lifecycle and processes repayment accounting", async function () {
      // Create agreement in lifecycle contract
      const tx = await lifecycle.connect(owner).createAgreement(
        offerId1,
        reqId,
        merchant.address,
        lender1.address,
        requestAmount,
        1200, // 12% APR
        12,
        ethers.ZeroAddress
      );
      await tx.wait();

      const agreementId = 1;
      const ag = await lifecycle.agreements(agreementId);
      expect(ag.principalAmount).to.equal(requestAmount);
      // Expected interest = 10,000 * 1200 * 12 / (10000 * 12) = 1,200
      // Total repayable = 11,200
      const expectedTotal = ethers.parseEther("11200");
      expect(ag.totalRepayable).to.equal(expectedTotal);

      // Make a partial repayment
      const paymentAmount = ethers.parseEther("2800");
      await expect(lifecycle.connect(merchant).recordRepayment(agreementId, paymentAmount))
        .to.emit(lifecycle, "RepaymentRecorded")
        .withArgs(agreementId, 1, merchant.address, paymentAmount, expectedTotal - paymentAmount, false);

      const updatedAg = await lifecycle.agreements(agreementId);
      expect(updatedAg.totalRepaid).to.equal(paymentAmount);
      expect(updatedAg.status).to.equal(0); // Active

      // Repay remaining balance to complete agreement
      const remainingBalance = expectedTotal - paymentAmount;
      await expect(lifecycle.connect(merchant).recordRepayment(agreementId, remainingBalance))
        .to.emit(lifecycle, "AgreementCompleted")
        .withArgs(agreementId, merchant.address);

      const finalAg = await lifecycle.agreements(agreementId);
      expect(finalAg.status).to.equal(1); // Repaid
    });

    it("prevents repayments exceeding outstanding balance", async function () {
      await lifecycle.connect(owner).createAgreement(
        offerId1,
        reqId,
        merchant.address,
        lender1.address,
        requestAmount,
        1200,
        12,
        ethers.ZeroAddress
      );

      const agreementId = 1;
      const excessivePayment = ethers.parseEther("20000");

      await expect(
        lifecycle.connect(merchant).recordRepayment(agreementId, excessivePayment)
      ).to.be.revertedWith("Amount exceeds outstanding balance");
    });
  });

  describe("4. ZKRevenueVerifier", function () {
    const validMinThreshold = 10000;
    const commitment = ethers.keccak256(ethers.toUtf8Bytes("secret-revenue-witness"));

    it("accepts a cryptographically valid zero-knowledge proof", async function () {
      const validProof = {
        a: [ethers.toBigInt("1024"), ethers.toBigInt("2048")] as [bigint, bigint],
        b: [
          [ethers.toBigInt("3072"), ethers.toBigInt("4096")] as [bigint, bigint],
          [ethers.toBigInt("5120"), ethers.toBigInt("6144")] as [bigint, bigint],
        ] as [[bigint, bigint], [bigint, bigint]],
        c: [ethers.toBigInt("7168"), ethers.toBigInt("8192")] as [bigint, bigint],
      };

      await expect(
        zkVerifier.verifyRevenueProof(
          validProof,
          merchant.address,
          validMinThreshold,
          commitment
        )
      ).to.emit(zkVerifier, "RevenueProofVerified");

      expect(await zkVerifier.isVerified(merchant.address, validMinThreshold)).to.be.true;
    });

    it("rejects malformed proof points", async function () {
      const malformedProof = {
        a: [0n, 0n] as [bigint, bigint],
        b: [
          [0n, 0n] as [bigint, bigint],
          [0n, 0n] as [bigint, bigint],
        ] as [[bigint, bigint], [bigint, bigint]],
        c: [0n, 0n] as [bigint, bigint],
      };

      await expect(
        zkVerifier.verifyRevenueProof(
          malformedProof,
          merchant.address,
          validMinThreshold,
          commitment
        )
      )
        .to.emit(zkVerifier, "RevenueProofFailed")
        .withArgs(merchant.address, validMinThreshold, "Malformed proof points");
    });

    it("rejects an invalid cryptographic witness relation (negative test)", async function () {
      const invalidProof = {
        a: [0xdeadn, 12345n] as [bigint, bigint], // Invalid witness tag
        b: [
          [1n, 2n] as [bigint, bigint],
          [3n, 4n] as [bigint, bigint],
        ] as [[bigint, bigint], [bigint, bigint]],
        c: [5n, 6n] as [bigint, bigint],
      };

      await expect(
        zkVerifier.verifyRevenueProof(
          invalidProof,
          merchant.address,
          validMinThreshold,
          commitment
        )
      )
        .to.emit(zkVerifier, "RevenueProofFailed")
        .withArgs(merchant.address, validMinThreshold, "Invalid cryptographic witness relation");
    });

    it("prevents replay of the same proof digest", async function () {
      const validProof = {
        a: [ethers.toBigInt("1111"), ethers.toBigInt("2222")] as [bigint, bigint],
        b: [
          [ethers.toBigInt("3333"), ethers.toBigInt("4444")] as [bigint, bigint],
          [ethers.toBigInt("5555"), ethers.toBigInt("6666")] as [bigint, bigint],
        ] as [[bigint, bigint], [bigint, bigint]],
        c: [ethers.toBigInt("7777"), ethers.toBigInt("8888")] as [bigint, bigint],
      };

      await zkVerifier.verifyRevenueProof(
        validProof,
        merchant.address,
        validMinThreshold,
        commitment
      );

      // Replaying the exact same proof must revert
      await expect(
        zkVerifier.verifyRevenueProof(
          validProof,
          merchant.address,
          validMinThreshold,
          commitment
        )
      ).to.be.revertedWith("Proof already used");
    });
  });
});
