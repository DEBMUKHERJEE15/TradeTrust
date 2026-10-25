import {
  FinancingRequest,
  LenderOffer,
  FinancingAgreement,
  BusinessCredential,
  ActivityLog,
  BusinessProfile,
  SupplierProfile,
  SupplierAttestation,
  DisputeRecord,
  CounterOfferProposal,
  ApplicationStatus,
} from "@/types";

export interface TradeTrustStoreState {
  currentRole: "merchant" | "lender";
  walletAddress: string;
  isWalletConnected: boolean;
  network: {
    chainId: number;
    name: string;
    rpcUrl: string;
    explorerUrl: string;
  };
  merchantProfile: BusinessProfile;
  lenderProfile: {
    name: string;
    institution: string;
    address: string;
    totalCapitalAvailable: number;
    activeDeployments: number;
  };
  requests: FinancingRequest[];
  offers: LenderOffer[];
  agreements: FinancingAgreement[];
  credentials: BusinessCredential[];
  activityLogs: ActivityLog[];
  suppliers: SupplierProfile[];
  supplierAttestations: SupplierAttestation[];
  disputes: DisputeRecord[];
  spendingAuthorization: {
    agentAddress: string;
    cumulativeLimit: number;
    spentAmount: number;
    perTransactionLimit: number;
    expiresAt: number;
    isActive: boolean;
  };
  bitrefillConfig: {
    hasCustomKeys: boolean;
    mode: "sandbox" | "live";
  };
}

const INITIAL_STATE: TradeTrustStoreState = {
  currentRole: "merchant",
  walletAddress: "",
  isWalletConnected: false,
  network: {
    chainId: 84532,
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    explorerUrl: "https://sepolia-explorer.base.org",
  },
  merchantProfile: {
    businessName: "Apex Provisions & Fresh Market",
    businessType: "Retail Grocer & FMCG Merchant",
    registrationNumber: "REG-TX-2022-849102",
    country: "United States",
    city: "Austin, TX",
    yearsInOperation: 3.5,
    monthlyRevenueEstimate: 24500,
    monthlyExpensesEstimate: 16200,
    walletAddress: "",
  },
  lenderProfile: {
    name: "Elena Vance (Portfolio Lead)",
    institution: "BlueHarbor Micro-Credit Fund",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    totalCapitalAvailable: 250000,
    activeDeployments: 84500,
  },
  requests: [
    {
      id: "REQ-2026-001",
      merchantAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      businessName: "Apex Provisions & Fresh Market",
      businessType: "Retail Grocer & FMCG Merchant",
      city: "Austin, TX",
      country: "United States",
      requestedAmount: 12500,
      currency: "USD",
      purpose: "Bulk Holiday Inventory & POS Hardware Upgrade",
      durationMonths: 12,
      maxAcceptableApr: 14.0,
      intendedUse: "Procure fast-moving refrigerated food staples, packaging supplies, and deploy secondary payment terminal.",
      monthlyRevenue: 24500,
      monthlyExpenses: 16200,
      evidenceSummary: {
        invoicesVerified: true,
        revenueProofGenerated: true,
        revenueCommitmentHash: "0x4b7c19f5a8e23d047b198c253d8e90f142b7c6a51d9e20fa41b72e90c8f53a12",
        verifiedThreshold: 15000,
        documentsCount: 4,
      },
      consentGiven: true,
      status: "offers_received",
      createdAt: Date.now() - 36 * 3600 * 1000,
      expiresAt: Date.now() + 26 * 24 * 3600 * 1000,
      onchainRequestId: 1,
      baseSepoliaTxHash: "0x892a4f61e89b2c34d5e67f890123456789abcdef0123456789abcdef01234567",
    },
    {
      id: "REQ-2026-002",
      merchantAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      businessName: "Savanna Mobile & Tech Services",
      businessType: "Electronics & Repair Depot",
      city: "Nairobi",
      country: "Kenya",
      requestedAmount: 6000,
      currency: "USD",
      purpose: "Procure diagnostic equipment & screen replacement inventory",
      durationMonths: 6,
      maxAcceptableApr: 15.5,
      intendedUse: "Purchase specialized soldering stations and replacement glass panels.",
      monthlyRevenue: 14200,
      monthlyExpenses: 8900,
      evidenceSummary: {
        invoicesVerified: true,
        revenueProofGenerated: true,
        revenueCommitmentHash: "0x7c9e12f4b8a21d035a187b243c7d89e031a6b5c40d8e19fa30b61e89b7e42a01",
        verifiedThreshold: 10000,
        documentsCount: 3,
      },
      consentGiven: true,
      status: "under_review",
      createdAt: Date.now() - 14 * 3600 * 1000,
      expiresAt: Date.now() + 28 * 24 * 3600 * 1000,
      onchainRequestId: 2,
    },
    {
      id: "REQ-2026-003",
      merchantAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
      businessName: "Highland Organic Bakery & Roastery",
      businessType: "Bakery & Specialty Coffee",
      city: "Denver, CO",
      country: "United States",
      requestedAmount: 20000,
      currency: "USD",
      purpose: "Commercial Deck Oven & Cold-Brew Kegging System",
      durationMonths: 18,
      maxAcceptableApr: 12.0,
      intendedUse: "Expand baking capacity for wholesale cafe distribution.",
      monthlyRevenue: 38000,
      monthlyExpenses: 24000,
      evidenceSummary: {
        invoicesVerified: true,
        revenueProofGenerated: true,
        revenueCommitmentHash: "0x1a2b3c4d5e6f7890123456789abcdef0123456789abcdef0123456789abcdef0",
        verifiedThreshold: 30000,
        documentsCount: 5,
      },
      consentGiven: true,
      status: "submitted",
      createdAt: Date.now() - 6 * 3600 * 1000,
      expiresAt: Date.now() + 30 * 24 * 3600 * 1000,
      onchainRequestId: 3,
    },
  ],
  offers: [
    {
      id: "OFF-2026-001",
      requestId: "REQ-2026-001",
      lenderAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      lenderName: "BlueHarbor Micro-Credit Fund",
      amountOffered: 12500,
      interestAprBps: 1080,
      durationMonths: 12,
      monthlyPayment: 1154.17,
      totalRepayable: 13850.0,
      repaymentFrequency: "monthly",
      originationFee: 125,
      status: "active",
      termsSummary: "30-day grace period on first principal payment. Direct debit or ERC20 test-token repayment supported.",
      createdAt: Date.now() - 18 * 3600 * 1000,
      expiresAt: Date.now() + 12 * 24 * 3600 * 1000,
      onchainOfferId: 1,
      baseSepoliaTxHash: "0x56a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef",
    },
    {
      id: "OFF-2026-002",
      requestId: "REQ-2026-001",
      lenderAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
      lenderName: "Starlight Community Capital",
      amountOffered: 10000,
      interestAprBps: 1200,
      durationMonths: 10,
      monthlyPayment: 1100.0,
      totalRepayable: 11000.0,
      repaymentFrequency: "monthly",
      originationFee: 100,
      status: "active",
      termsSummary: "Flexible 10-month term with rebate on early full repayment.",
      createdAt: Date.now() - 12 * 3600 * 1000,
      expiresAt: Date.now() + 10 * 24 * 3600 * 1000,
      onchainOfferId: 2,
    },
  ],
  agreements: [
    {
      id: "AGR-2025-089",
      offerId: "OFF-HIST-089",
      requestId: "REQ-HIST-089",
      merchantAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      lenderAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      merchantName: "Apex Provisions & Fresh Market",
      lenderName: "BlueHarbor Micro-Credit Fund",
      principalAmount: 5000,
      interestAprBps: 1100,
      totalRepayable: 5550,
      totalRepaid: 4162.5,
      durationMonths: 12,
      installmentAmount: 462.5,
      installmentsTotal: 12,
      installmentsPaid: 9,
      nextDueTimestamp: Date.now() + 11 * 24 * 3600 * 1000,
      status: "active",
      startDate: Date.now() - 270 * 24 * 3600 * 1000,
      repayments: [
        {
          id: "PMT-001",
          agreementId: "AGR-2025-089",
          installmentNumber: 9,
          dueDate: Date.now() - 19 * 24 * 3600 * 1000,
          amountDue: 462.5,
          amountPaid: 462.5,
          paidAt: Date.now() - 20 * 24 * 3600 * 1000,
          status: "paid",
          txHash: "0x12a34b56c78d90ef123456789abcdef0123456789abcdef0123456789abcdef1",
          notes: "On-time automatic repayment processed",
        },
        {
          id: "PMT-002",
          agreementId: "AGR-2025-089",
          installmentNumber: 10,
          dueDate: Date.now() + 11 * 24 * 3600 * 1000,
          amountDue: 462.5,
          amountPaid: 0,
          status: "pending",
        },
        {
          id: "PMT-003",
          agreementId: "AGR-2025-089",
          installmentNumber: 11,
          dueDate: Date.now() + 41 * 24 * 3600 * 1000,
          amountDue: 462.5,
          amountPaid: 0,
          status: "pending",
        },
        {
          id: "PMT-004",
          agreementId: "AGR-2025-089",
          installmentNumber: 12,
          dueDate: Date.now() + 71 * 24 * 3600 * 1000,
          amountDue: 462.5,
          amountPaid: 0,
          status: "pending",
        },
      ],
      onchainAgreementId: 1,
      baseSepoliaTxHash: "0xaa11bb22cc33dd44ee55ff6600112233445566778899aabbccddeeff00112233",
    },
  ],
  credentials: [
    {
      id: "CRED-001",
      commitmentHash: "0x4b7c19f5a8e23d047b198c253d8e90f142b7c6a51d9e20fa41b72e90c8f53a12",
      merchantAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      issuerName: "TradeTrust Evidence Attestor v1",
      issuerAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      credType: "REVENUE_THRESHOLD",
      title: "Monthly Turnover Proof (Turnover >= $15,000)",
      description: "Cryptographic Groth16 proof demonstrating certified sales turnover exceeding $15,000/mo without revealing raw financial ledgers.",
      verifiedMetric: "Monthly Revenue >= $15,000 USD",
      issuedAt: Date.now() - 36 * 3600 * 1000,
      expiresAt: Date.now() + 84 * 24 * 3600 * 1000,
      isRevoked: false,
      onchainTxHash: "0x71b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
      schemaUri: "https://schema.tradetrust.org/credentials/revenue-v1.json",
    },
    {
      id: "CRED-002",
      commitmentHash: "0x98f7e6d5c4b3a210987654321fedcba0987654321fedcba0987654321fedcba0",
      merchantAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      issuerName: "Texas Dept of State Enterprise Registrar",
      issuerAddress: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
      credType: "BUSINESS_REGISTRATION",
      title: "Active Good-Standing Merchant Entity",
      description: "State registration attestation confirming valid corporate existence and absence of active tax liens.",
      verifiedMetric: "Entity Status: Active Good-Standing (REG-TX-2022-849102)",
      issuedAt: Date.now() - 120 * 24 * 3600 * 1000,
      expiresAt: Date.now() + 245 * 24 * 3600 * 1000,
      isRevoked: false,
      onchainTxHash: "0x3344556677889900112233445566778899001122334455667788990011223344",
      schemaUri: "https://schema.tradetrust.org/credentials/registration-v1.json",
    },
    {
      id: "CRED-003",
      commitmentHash: "0xaa22bb33cc44dd55ee66ff778899aabbccddeeff00112233445566778899aabb",
      merchantAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      issuerName: "TradeTrust Repayment Ledger Oracle",
      issuerAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      credType: "REPAYMENT_TRACK_RECORD",
      title: "Verified On-Time Repayment Track Record",
      description: "Confirmed 9 consecutive on-time installment payments with 100% compliance rate on previous facilities.",
      verifiedMetric: "On-Time Repayment Rate: 100% (9/9 Installments)",
      issuedAt: Date.now() - 20 * 24 * 3600 * 1000,
      expiresAt: Date.now() + 180 * 24 * 3600 * 1000,
      isRevoked: false,
      onchainTxHash: "0x5566778899001122334455667788990011223344556677889900112233445566",
      schemaUri: "https://schema.tradetrust.org/credentials/repayment-track-v1.json",
    },
  ],
  suppliers: [
    {
      id: "SUP-001",
      name: "SunHarvest Agro & Packaging Wholesale",
      category: "Food Staples & Bulk Goods",
      country: "United States",
      city: "San Antonio, TX",
      walletAddress: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4df",
      rating: 4.9,
      totalVolumeDelivered: 142000,
      verifiedStatus: "verified",
      joinedDate: Date.now() - 400 * 24 * 3600 * 1000,
    },
    {
      id: "SUP-002",
      name: "Apex Diagnostic Wholesale & POS Hardware",
      category: "Retail Tech & Terminals",
      country: "United States",
      city: "Dallas, TX",
      walletAddress: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
      rating: 4.8,
      totalVolumeDelivered: 89000,
      verifiedStatus: "verified",
      joinedDate: Date.now() - 250 * 24 * 3600 * 1000,
    },
    {
      id: "SUP-003",
      name: "Global Digital Utility & Airtime Depot",
      category: "Digital Vouchers & Utilities",
      country: "United States",
      city: "Wilmington, DE",
      walletAddress: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
      rating: 5.0,
      totalVolumeDelivered: 310000,
      verifiedStatus: "verified",
      joinedDate: Date.now() - 500 * 24 * 3600 * 1000,
    },
  ],
  supplierAttestations: [
    {
      id: "ATT-2026-081",
      supplierId: "SUP-001",
      supplierName: "SunHarvest Agro & Packaging Wholesale",
      merchantAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      poNumber: "PO-TX-90412",
      invoiceAmount: 4200,
      currency: "USD",
      description: "Batch delivery: 8 pallets organic rolled oats, canned legumes, and biodegradable paper packaging.",
      deliveryStatus: "delivered",
      attestationHash: "0x99aabbccddeeff00112233445566778899aabbccddeeff001122334455667788",
      issuedAt: Date.now() - 14 * 24 * 3600 * 1000,
      onchainTxHash: "0x445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233",
    },
    {
      id: "ATT-2026-094",
      supplierId: "SUP-002",
      supplierName: "Apex Diagnostic Wholesale & POS Hardware",
      merchantAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      poNumber: "PO-TX-91024",
      invoiceAmount: 1850,
      currency: "USD",
      description: "2x EMV Contactless POS Terminals with LTE backup modules.",
      deliveryStatus: "delivered",
      attestationHash: "0x11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff",
      issuedAt: Date.now() - 5 * 24 * 3600 * 1000,
      onchainTxHash: "0x66778899aabbccddeeff00112233445566778899aabbccddeeff001122334455",
    },
  ],
  disputes: [
    {
      id: "DSP-001",
      entityType: "CREDENTIAL",
      entityId: "CRED-002",
      merchantAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      title: "Business Address Typo on State Registry Attestation",
      description: "Suite number was recorded as Suite 4B instead of Suite 4A during state ingest. Requested clerical amendment.",
      status: "resolved",
      createdAt: Date.now() - 15 * 24 * 3600 * 1000,
      resolvedAt: Date.now() - 12 * 24 * 3600 * 1000,
      resolutionNote: "Address record verified against lease deed and re-attested.",
    },
  ],
  activityLogs: [
    {
      id: "LOG-001",
      timestamp: Date.now() - 36 * 3600 * 1000,
      category: "financing",
      title: "Financing Request Created",
      description: "Apex Provisions submitted a $12,500 working capital request with ZK revenue proof.",
      actorRole: "merchant",
      actorAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      txHash: "0x892a4f61e89b2c34d5e67f890123456789abcdef0123456789abcdef01234567",
      status: "confirmed",
    },
    {
      id: "LOG-002",
      timestamp: Date.now() - 35 * 3600 * 1000,
      category: "privacy",
      title: "Zero-Knowledge Revenue Proof Verified",
      description: "Offchain Groth16 proof validated: Turnover >= $15,000/mo without revealing bank data.",
      actorRole: "system",
      status: "confirmed",
    },
    {
      id: "LOG-003",
      timestamp: Date.now() - 18 * 3600 * 1000,
      category: "financing",
      title: "Lender Offer Dispatched",
      description: "BlueHarbor Micro-Credit Fund extended an offer of $12,500 at 10.8% APR.",
      actorRole: "lender",
      actorAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      txHash: "0x56a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef",
      status: "confirmed",
    },
    {
      id: "LOG-004",
      timestamp: Date.now() - 20 * 24 * 3600 * 1000,
      category: "repayment",
      title: "Installment #9 Repayment Confirmed",
      description: "Monthly repayment of $462.50 verified and stamped onchain for Agreement AGR-2025-089.",
      actorRole: "merchant",
      actorAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      txHash: "0x12a34b56c78d90ef123456789abcdef0123456789abcdef0123456789abcdef1",
      status: "confirmed",
    },
  ],
  spendingAuthorization: {
    agentAddress: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
    cumulativeLimit: 500.0,
    spentAmount: 120.0,
    perTransactionLimit: 150.0,
    expiresAt: Date.now() + 7 * 24 * 3600 * 1000,
    isActive: true,
  },
  bitrefillConfig: {
    hasCustomKeys: false,
    mode: "sandbox",
  },
};

const STORAGE_KEY = "tradetrust_state_v1";

export function getStore(): TradeTrustStoreState {
  if (typeof window === "undefined") {
    return INITIAL_STATE;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STATE));
      return INITIAL_STATE;
    }
    const parsed = JSON.parse(raw);
    // Ensure backwards compatibility with newly added fields
    if (!parsed.suppliers) parsed.suppliers = INITIAL_STATE.suppliers;
    if (!parsed.supplierAttestations) parsed.supplierAttestations = INITIAL_STATE.supplierAttestations;
    if (!parsed.disputes) parsed.disputes = INITIAL_STATE.disputes;
    return parsed;
  } catch {
    return INITIAL_STATE;
  }
}

export function saveStore(state: TradeTrustStoreState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event("tradetrust_store_updated"));
  } catch (err) {
    console.error("Failed to save TradeTrust store:", err);
  }
}

export function resetDemoState(): TradeTrustStoreState {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STATE));
    window.dispatchEvent(new Event("tradetrust_store_updated"));
  }
  return INITIAL_STATE;
}

// ACTION HELPERS: REPAYMENTS
export function recordRepayment(agreementId: string, amount: number, txHash?: string, notes?: string): boolean {
  const store = getStore();
  const agreement = store.agreements.find((a) => a.id === agreementId);
  if (!agreement) return false;

  const nextPendingInstallment = agreement.repayments.find((r) => r.status === "pending" || r.status === "overdue");
  if (!nextPendingInstallment) return false;

  const paymentHash = txHash || "0x" + Math.random().toString(16).substring(2, 66);
  nextPendingInstallment.status = "paid";
  nextPendingInstallment.amountPaid = amount;
  nextPendingInstallment.paidAt = Date.now();
  nextPendingInstallment.txHash = paymentHash;
  if (notes) nextPendingInstallment.notes = notes;

  agreement.totalRepaid += amount;
  agreement.installmentsPaid += 1;
  if (agreement.totalRepaid >= agreement.totalRepayable || agreement.installmentsPaid >= agreement.installmentsTotal) {
    agreement.status = "repaid";
  }

  // Next installment timestamp update
  const remainingInstallment = agreement.repayments.find((r) => r.status === "pending");
  if (remainingInstallment) {
    agreement.nextDueTimestamp = remainingInstallment.dueDate;
  }

  // Append Activity Log
  const newLog: ActivityLog = {
    id: `LOG-${Date.now()}`,
    timestamp: Date.now(),
    category: "repayment",
    title: `Repayment Recorded (${agreement.id})`,
    description: `Confirmed payment of $${amount.toFixed(2)} for installment #${nextPendingInstallment.installmentNumber}.`,
    actorRole: store.currentRole,
    actorAddress: store.walletAddress,
    txHash: paymentHash,
    status: "confirmed",
  };
  store.activityLogs.unshift(newLog);

  saveStore(store);
  return true;
}

// ACTION HELPERS: LENDER OFFERS
export function createLenderOffer(offerData: Omit<LenderOffer, "id" | "createdAt" | "status">): LenderOffer {
  const store = getStore();
  const newOfferId = `OFF-2026-00${store.offers.length + 1}`;
  const newOffer: LenderOffer = {
    ...offerData,
    id: newOfferId,
    status: "active",
    createdAt: Date.now(),
  };

  store.offers.unshift(newOffer);

  // Update request status to offers_received
  const req = store.requests.find((r) => r.id === offerData.requestId);
  if (req && req.status === "under_review" || req?.status === "submitted") {
    req.status = "offers_received";
  }

  // Activity Log
  store.activityLogs.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: Date.now(),
    category: "financing",
    title: "New Lender Offer Issued",
    description: `${newOffer.lenderName} offered $${newOffer.amountOffered.toLocaleString()} at ${(newOffer.interestAprBps / 100).toFixed(1)}% APR for request ${newOffer.requestId}.`,
    actorRole: "lender",
    actorAddress: newOffer.lenderAddress,
    status: "confirmed",
  });

  saveStore(store);
  return newOffer;
}

export function withdrawLenderOffer(offerId: string): boolean {
  const store = getStore();
  const offer = store.offers.find((o) => o.id === offerId);
  if (!offer) return false;

  offer.status = "withdrawn";

  store.activityLogs.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: Date.now(),
    category: "financing",
    title: "Lender Offer Withdrawn",
    description: `Offer ${offer.id} for $${offer.amountOffered.toLocaleString()} was withdrawn by lender.`,
    actorRole: "lender",
    actorAddress: offer.lenderAddress,
    status: "confirmed",
  });

  saveStore(store);
  return true;
}

export function submitCounterOffer(offerId: string, proposedApr: number, proposedDurationMonths: number, merchantNote: string): boolean {
  const store = getStore();
  const offer = store.offers.find((o) => o.id === offerId);
  if (!offer) return false;

  const counter: CounterOfferProposal = {
    id: `CNT-${Date.now()}`,
    offerId,
    merchantAddress: store.walletAddress,
    proposedApr,
    proposedDurationMonths,
    merchantNote,
    status: "pending",
    createdAt: Date.now(),
  };

  offer.counterOffer = counter;
  offer.status = "countered";

  store.activityLogs.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: Date.now(),
    category: "financing",
    title: "Merchant Submitted Counteroffer",
    description: `Merchant proposed ${proposedApr}% APR (${proposedDurationMonths} mo) with note: "${merchantNote}"`,
    actorRole: "merchant",
    actorAddress: store.walletAddress,
    status: "confirmed",
  });

  saveStore(store);
  return true;
}

export function submitDispute(disputeData: Omit<DisputeRecord, "id" | "createdAt" | "status">): DisputeRecord {
  const store = getStore();
  const newDispute: DisputeRecord = {
    ...disputeData,
    id: `DSP-00${store.disputes.length + 1}`,
    status: "open",
    createdAt: Date.now(),
  };

  store.disputes.unshift(newDispute);

  store.activityLogs.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: Date.now(),
    category: "financing",
    title: "Correction / Dispute Request Raised",
    description: `Dispute filed regarding ${newDispute.entityType} ${newDispute.entityId}: ${newDispute.title}`,
    actorRole: "merchant",
    actorAddress: newDispute.merchantAddress,
    status: "confirmed",
  });

  saveStore(store);
  return newDispute;
}

export function updateApplicationStatus(requestId: string, status: ApplicationStatus, notes?: string): boolean {
  const store = getStore();
  const req = store.requests.find((r) => r.id === requestId);
  if (!req) return false;

  req.status = status;

  store.activityLogs.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: Date.now(),
    category: "financing",
    title: `Application Status Changed to ${status.toUpperCase()}`,
    description: `Request ${req.id} updated. ${notes ? `Note: ${notes}` : ""}`,
    actorRole: store.currentRole,
    status: "confirmed",
  });

  saveStore(store);
  return true;
}
