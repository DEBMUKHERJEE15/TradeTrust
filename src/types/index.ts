export type UserRole = "merchant" | "lender" | "admin";

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "more_info_required"
  | "offers_received"
  | "accepted"
  | "funded"
  | "rejected"
  | "cancelled";

export type OfferStatus = "active" | "accepted" | "rejected" | "expired" | "withdrawn" | "countered";

export type AgreementStatus = "active" | "repaid" | "in_default";

export interface BusinessProfile {
  businessName: string;
  businessType: string;
  registrationNumber?: string;
  country: string;
  city: string;
  yearsInOperation: number;
  monthlyRevenueEstimate: number;
  monthlyExpensesEstimate: number;
  walletAddress: string;
}

export interface FinancingRequest {
  id: string;
  merchantAddress: string;
  businessName: string;
  businessType: string;
  city: string;
  country: string;
  requestedAmount: number;
  currency: string;
  purpose: string;
  durationMonths: number;
  maxAcceptableApr: number;
  intendedUse: string;
  monthlyRevenue: number;
  monthlyExpenses: number;
  evidenceSummary: {
    invoicesVerified: boolean;
    revenueProofGenerated: boolean;
    revenueCommitmentHash: string;
    verifiedThreshold: number;
    documentsCount: number;
  };
  consentGiven: boolean;
  status: ApplicationStatus;
  createdAt: number;
  expiresAt: number;
  onchainRequestId?: number;
  baseSepoliaTxHash?: string;
}

export interface LenderOffer {
  id: string;
  requestId: string;
  lenderAddress: string;
  lenderName: string;
  amountOffered: number;
  interestAprBps: number;
  durationMonths: number;
  monthlyPayment: number;
  totalRepayable: number;
  repaymentFrequency: "monthly" | "bi-weekly" | "weekly";
  originationFee: number;
  status: OfferStatus;
  termsSummary: string;
  createdAt: number;
  expiresAt: number;
  onchainOfferId?: number;
  baseSepoliaTxHash?: string;
  counterOffer?: CounterOfferProposal;
}

export interface CounterOfferProposal {
  id: string;
  offerId: string;
  merchantAddress: string;
  proposedApr: number;
  proposedDurationMonths: number;
  merchantNote: string;
  status: "pending" | "accepted" | "declined";
  createdAt: number;
}

export interface RepaymentInstallment {
  id: string;
  agreementId: string;
  installmentNumber: number;
  dueDate: number;
  amountDue: number;
  amountPaid: number;
  paidAt?: number;
  status: "pending" | "paid" | "overdue";
  txHash?: string;
  notes?: string;
}

export interface FinancingAgreement {
  id: string;
  offerId: string;
  requestId: string;
  merchantAddress: string;
  lenderAddress: string;
  merchantName: string;
  lenderName: string;
  principalAmount: number;
  interestAprBps: number;
  totalRepayable: number;
  totalRepaid: number;
  durationMonths: number;
  installmentAmount: number;
  installmentsTotal: number;
  installmentsPaid: number;
  nextDueTimestamp: number;
  status: AgreementStatus;
  startDate: number;
  repayments: RepaymentInstallment[];
  onchainAgreementId?: number;
  baseSepoliaTxHash?: string;
}

export interface BusinessCredential {
  id: string;
  commitmentHash: string;
  merchantAddress: string;
  issuerName: string;
  issuerAddress: string;
  credType: "REVENUE_THRESHOLD" | "BUSINESS_REGISTRATION" | "TAX_COMPLIANCE" | "SUPPLIER_INVOICE" | "REPAYMENT_TRACK_RECORD";
  title: string;
  description: string;
  verifiedMetric: string;
  issuedAt: number;
  expiresAt: number;
  isRevoked: boolean;
  onchainTxHash?: string;
  schemaUri: string;
}

export interface ActivityLog {
  id: string;
  timestamp: number;
  category: "financing" | "privacy" | "commerce" | "onchain" | "repayment";
  title: string;
  description: string;
  actorRole: "merchant" | "lender" | "ai_agent" | "system";
  actorAddress?: string;
  txHash?: string;
  status: "confirmed" | "pending" | "failed";
}

export interface SupplierProfile {
  id: string;
  name: string;
  category: string;
  country: string;
  city: string;
  walletAddress: string;
  rating: number;
  totalVolumeDelivered: number;
  verifiedStatus: "verified" | "under_review" | "unverified";
  joinedDate: number;
}

export interface SupplierAttestation {
  id: string;
  supplierId: string;
  supplierName: string;
  merchantAddress: string;
  poNumber: string;
  invoiceAmount: number;
  currency: string;
  description: string;
  deliveryStatus: "delivered" | "in_transit" | "pending";
  attestationHash: string;
  issuedAt: number;
  onchainTxHash?: string;
}

export interface DisputeRecord {
  id: string;
  entityType: "CREDENTIAL" | "REPAYMENT" | "APPLICATION" | "OFFER";
  entityId: string;
  merchantAddress: string;
  title: string;
  description: string;
  status: "open" | "in_review" | "resolved" | "dismissed";
  createdAt: number;
  resolvedAt?: number;
  resolutionNote?: string;
}

export interface StressTestScenario {
  salesDropPercent: number;
  expenseSpikePercent: number;
  collectionDelayDays: number;
  dscr: number; // Debt Service Coverage Ratio
  projectedMonthlyCashFlow: number;
  projectedMonthlySurplus: number;
  affordabilityStatus: "resilient" | "moderate" | "distressed";
  recommendations: string[];
}
