"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Building2,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Lock,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Calendar,
  Layers,
  HelpCircle
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getStore, saveStore } from "@/lib/state/demoStore";
import { computeRevenueCommitment } from "@/lib/zk/zkEngine";
import { FinancingRequest } from "@/types";

export default function FinancingApplicationPage() {
  const router = useRouter();
  const [store, setStore] = useState(getStore());
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<FinancingRequest | null>(null);

  // Form State initialized with realistic merchant defaults
  const [formData, setFormData] = useState({
    // Step 1: Business Profile
    businessName: store.merchantProfile.businessName,
    businessType: store.merchantProfile.businessType,
    city: store.merchantProfile.city,
    country: store.merchantProfile.country,
    yearsInOperation: store.merchantProfile.yearsInOperation,
    registrationNumber: store.merchantProfile.registrationNumber || "REG-TX-2022-849102",

    // Step 2: Financing Requirements
    requestedAmount: 15000,
    currency: "USD",
    purpose: "Seasonal Inventory Procurement & Retail Display Expansion",
    durationMonths: 12,
    maxAcceptableApr: 13.5,
    intendedUse: "Procure fast-turnover packaged food staples, seasonal bakery inventory, and upgrade point-of-sale terminal.",

    // Step 3: Business Evidence
    monthlyRevenue: store.merchantProfile.monthlyRevenueEstimate,
    monthlyExpenses: store.merchantProfile.monthlyExpensesEstimate,
    invoicesCount: 3,
    supplierName: "SunHarvest Agro & Packaging Wholesale",
    sourceOfVerification: "Verified POS API Sync + Offchain Bank Statement Digest",

    // Step 4: Consent
    consentDataProcessing: true,
    consentZkDisclosure: true,
    consentBaseSepoliaPublish: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!formData.businessName.trim()) errs.businessName = "Business name is required.";
      if (!formData.businessType.trim()) errs.businessType = "Business type is required.";
      if (!formData.city.trim()) errs.city = "City is required.";
      if (formData.yearsInOperation < 0.25) errs.yearsInOperation = "Minimum operating history is 3 months.";
    }

    if (step === 2) {
      if (formData.requestedAmount < 500) errs.requestedAmount = "Minimum financing amount is $500.";
      if (formData.requestedAmount > 250000) errs.requestedAmount = "Maximum financing request is $250,000.";
      if (!formData.purpose.trim()) errs.purpose = "Purpose is required.";
      if (formData.durationMonths < 1 || formData.durationMonths > 60) errs.durationMonths = "Duration must be between 1 and 60 months.";
    }

    if (step === 3) {
      if (formData.monthlyRevenue <= 0) errs.monthlyRevenue = "Monthly revenue must be greater than zero.";
      if (formData.monthlyExpenses < 0) errs.monthlyExpenses = "Monthly expenses cannot be negative.";
      if (formData.monthlyExpenses >= formData.monthlyRevenue) errs.monthlyExpenses = "Warning: Operating expenses exceed reported revenue.";
    }

    if (step === 4) {
      if (!formData.consentDataProcessing || !formData.consentZkDisclosure || !formData.consentBaseSepoliaPublish) {
        errs.consent = "All consent acknowledgments are mandatory for processing.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(5, prev + 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);

    try {
      // Simulate onchain commitment generation
      const salt = "0x" + Math.random().toString(16).substring(2, 66).padStart(64, "0");
      const commitmentHash = computeRevenueCommitment(
        formData.monthlyRevenue,
        salt,
        store.walletAddress
      );

      const newId = `REQ-2026-${Math.floor(100 + Math.random() * 900)}`;
      const randomTx = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

      const newRequest: FinancingRequest = {
        id: newId,
        merchantAddress: store.walletAddress,
        businessName: formData.businessName,
        businessType: formData.businessType,
        city: formData.city,
        country: formData.country,
        requestedAmount: formData.requestedAmount,
        currency: formData.currency,
        purpose: formData.purpose,
        durationMonths: formData.durationMonths,
        maxAcceptableApr: formData.maxAcceptableApr,
        intendedUse: formData.intendedUse,
        monthlyRevenue: formData.monthlyRevenue,
        monthlyExpenses: formData.monthlyExpenses,
        evidenceSummary: {
          invoicesVerified: true,
          revenueProofGenerated: true,
          revenueCommitmentHash: commitmentHash,
          verifiedThreshold: 15000,
          documentsCount: formData.invoicesCount,
        },
        consentGiven: true,
        status: "under_review",
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 3600 * 1000,
        onchainRequestId: store.requests.length + 1,
        baseSepoliaTxHash: randomTx,
      };

      // Update persistent store
      const updatedRequests = [newRequest, ...store.requests];
      const updatedStore = { ...store, requests: updatedRequests };
      saveStore(updatedStore);
      setStore(updatedStore);
      setSubmittedRequest(newRequest);
    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-foreground">Merchant Working-Capital Application</h1>
            <p className="text-xs text-foreground-secondary">
              Verified business evidence. Selective disclosure. No unapproved PII onchain.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-mint/10 text-mint border border-mint/20">
            Base Sepolia #84532
          </span>
        </div>

        {/* Step Indicator */}
        {!submittedRequest && (
          <div className="p-4 rounded-xl bg-surface-card border border-theme">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-foreground-secondary font-medium">Step {currentStep} of 5</span>
              <span className="text-mint font-mono font-semibold">
                {currentStep === 1 && "Business Profile"}
                {currentStep === 2 && "Financing Requirements"}
                {currentStep === 3 && "Business Evidence"}
                {currentStep === 4 && "Consent & Verification"}
                {currentStep === 5 && "Review & Submit"}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${
                    s <= currentStep ? "bg-mint" : "bg-[#1A263D]"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* SUCCESS CONFIRMATION STATE */}
        {submittedRequest ? (
          <div className="p-8 rounded-2xl bg-surface-card border border-mint/30 text-center space-y-6 animate-fade-in shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-mint/10 text-mint border border-mint/30 flex items-center justify-center mx-auto shadow-lg shadow-mint/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-mint/10 text-mint border border-mint/20">
                Application Submitted Successfully
              </span>
              <h2 className="text-2xl font-black text-foreground">Financing Request Broadcasted</h2>
              <p className="text-xs text-foreground-secondary max-w-md mx-auto leading-relaxed">
                Your application has been published to the Base Sepolia marketplace with an anchored zero-knowledge revenue commitment.
              </p>
            </div>

            {/* Traceable IDs Card */}
            <div className="p-4 rounded-xl bg-surface border border-theme text-left text-xs space-y-3 font-mono">
              <div className="flex justify-between items-center pb-2 border-b border-theme">
                <span className="text-foreground-secondary">Application ID:</span>
                <span className="text-foreground font-bold">{submittedRequest.id}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-theme">
                <span className="text-foreground-secondary">Onchain Request Index:</span>
                <span className="text-mint font-bold">#{submittedRequest.onchainRequestId}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-theme">
                <span className="text-foreground-secondary">ZK Revenue Commitment:</span>
                <span className="text-foreground-secondary truncate max-w-[200px]">
                  {submittedRequest.evidenceSummary.revenueCommitmentHash}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground-secondary">Base Sepolia Tx Hash:</span>
                <a
                  href={`https://sepolia-explorer.base.org/tx/${submittedRequest.baseSepoliaTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mint hover:underline flex items-center gap-1"
                >
                  <span className="truncate max-w-[180px]">{submittedRequest.baseSepoliaTxHash}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/app"
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-mint hover:bg-mint-muted text-black text-xs font-bold transition-all"
              >
                Go to Merchant Dashboard
              </Link>
              <Link
                href="/lender/requests"
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-surface-hover hover:bg-surface-hover text-foreground text-xs font-semibold transition-all"
              >
                Inspect from Lender View
              </Link>
            </div>
          </div>
        ) : (
          /* MULTI-STEP FORM BODY */
          <div className="p-6 rounded-2xl bg-surface-card border border-theme space-y-6 shadow-xl">
            {/* STEP 1: BUSINESS PROFILE */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="pb-3 border-b border-theme">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-mint" />
                    Step 1: Commercial Business Profile
                  </h3>
                  <p className="text-xs text-foreground-secondary">
                    Operating identity and verifiable corporate details.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-foreground-secondary font-medium mb-1">Legal or Trading Name *</label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground focus:outline-none focus:border-mint"
                      placeholder="e.g. Apex Provisions & Fresh Market"
                    />
                    {errors.businessName && <p className="text-rose-400 text-[11px] mt-1">{errors.businessName}</p>}
                  </div>

                  <div>
                    <label className="block text-foreground-secondary font-medium mb-1">Business Classification *</label>
                    <input
                      type="text"
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground focus:outline-none focus:border-mint"
                      placeholder="e.g. Retail Grocer & FMCG Merchant"
                    />
                    {errors.businessType && <p className="text-rose-400 text-[11px] mt-1">{errors.businessType}</p>}
                  </div>

                  <div>
                    <label className="block text-foreground-secondary font-medium mb-1">City / Region *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground focus:outline-none focus:border-mint"
                      placeholder="Austin, TX"
                    />
                    {errors.city && <p className="text-rose-400 text-[11px] mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-foreground-secondary font-medium mb-1">Operating History (Years) *</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.yearsInOperation}
                      onChange={(e) => setFormData({ ...formData, yearsInOperation: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground focus:outline-none focus:border-mint font-mono"
                    />
                    {errors.yearsInOperation && <p className="text-rose-400 text-[11px] mt-1">{errors.yearsInOperation}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-foreground-secondary font-medium mb-1">Entity Registration Reference (Optional)</label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground focus:outline-none focus:border-mint font-mono text-xs"
                    placeholder="REG-TX-2022-849102"
                  />
                  <p className="text-[11px] text-foreground-muted mt-1">Used offchain for registry verification without onchain PII exposure.</p>
                </div>
              </div>
            )}

            {/* STEP 2: FINANCING REQUIREMENTS */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="pb-3 border-b border-theme">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-mint" />
                    Step 2: Financing Requirements
                  </h3>
                  <p className="text-xs text-foreground-secondary">
                    Specify required capital, target repayment horizon, and utilization purpose.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-foreground-secondary font-medium mb-1">Requested Capital ($ USD) *</label>
                    <input
                      type="number"
                      value={formData.requestedAmount}
                      onChange={(e) => setFormData({ ...formData, requestedAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground focus:outline-none focus:border-mint font-mono text-sm font-bold"
                    />
                    {errors.requestedAmount && <p className="text-rose-400 text-[11px] mt-1">{errors.requestedAmount}</p>}
                  </div>

                  <div>
                    <label className="block text-foreground-secondary font-medium mb-1">Repayment Term (Months) *</label>
                    <select
                      value={formData.durationMonths}
                      onChange={(e) => setFormData({ ...formData, durationMonths: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground focus:outline-none focus:border-mint font-mono text-xs"
                    >
                      <option value={3}>3 Months</option>
                      <option value={6}>6 Months</option>
                      <option value={9}>9 Months</option>
                      <option value={12}>12 Months (1 Year)</option>
                      <option value={18}>18 Months</option>
                      <option value={24}>24 Months (2 Years)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-foreground-secondary font-medium mb-1">Maximum Acceptable APR (%) *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.maxAcceptableApr}
                      onChange={(e) => setFormData({ ...formData, maxAcceptableApr: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground focus:outline-none focus:border-mint font-mono"
                    />
                    <p className="text-[11px] text-foreground-muted mt-1">Offers exceeding this cap will be filtered out.</p>
                  </div>

                  <div>
                    <label className="block text-foreground-secondary font-medium mb-1">Primary Loan Category</label>
                    <input
                      type="text"
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground focus:outline-none focus:border-mint text-xs"
                      placeholder="e.g. Bulk Holiday Season Inventory"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-foreground-secondary font-medium mb-1">Intended Use of Funds *</label>
                  <textarea
                    rows={2}
                    value={formData.intendedUse}
                    onChange={(e) => setFormData({ ...formData, intendedUse: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground focus:outline-none focus:border-mint text-xs leading-relaxed"
                    placeholder="Describe inventory procurement items or equipment purchases..."
                  />
                </div>
              </div>
            )}

            {/* STEP 3: BUSINESS EVIDENCE */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="pb-3 border-b border-theme">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4 text-mint" />
                    Step 3: Financial Evidence & Turnover Verification
                  </h3>
                  <p className="text-xs text-foreground-secondary">
                    Numbers remain strictly in your encrypted local store. Only commitments are anchored onchain.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-foreground-secondary font-medium mb-1">Average Monthly Revenue ($ USD) *</label>
                    <input
                      type="number"
                      value={formData.monthlyRevenue}
                      onChange={(e) => setFormData({ ...formData, monthlyRevenue: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground focus:outline-none focus:border-mint font-mono text-sm font-bold"
                    />
                    {errors.monthlyRevenue && <p className="text-rose-400 text-[11px] mt-1">{errors.monthlyRevenue}</p>}
                  </div>

                  <div>
                    <label className="block text-foreground-secondary font-medium mb-1">Average Operating Expenses ($ USD) *</label>
                    <input
                      type="number"
                      value={formData.monthlyExpenses}
                      onChange={(e) => setFormData({ ...formData, monthlyExpenses: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground focus:outline-none focus:border-mint font-mono text-sm"
                    />
                    {errors.monthlyExpenses && <p className="text-rose-400 text-[11px] mt-1">{errors.monthlyExpenses}</p>}
                  </div>
                </div>

                {/* Evidence Documents Upload Sandbox */}
                <div className="p-4 rounded-xl bg-surface border border-theme space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-violet-400" /> Private Offchain Document Evidence
                    </span>
                    <span className="text-[10px] font-mono text-mint">3 Documents Staged</span>
                  </div>
                  <p className="text-[11px] text-foreground-secondary leading-relaxed">
                    Documents are hashed locally to compute zero-knowledge commitments. Raw bank PDF files are NEVER uploaded to public blockchains.
                  </p>
                  <div className="p-3 rounded-lg border border-dashed border-theme text-center text-xs text-foreground-secondary hover:border-mint/50 cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 mx-auto text-foreground-muted mb-1" />
                    <span>Upload Wholesale Invoices or Bank Turnover Statements (Offchain Storage)</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: CONSENT & VERIFICATION */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fade-in">
                <div className="pb-3 border-b border-theme">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-mint" />
                    Step 4: Explicit Consent & Selective Disclosure
                  </h3>
                  <p className="text-xs text-foreground-secondary">
                    Review and authorize exactly which cryptographic parameters are broadcasted to lenders.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <label className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-theme cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.consentDataProcessing}
                      onChange={(e) => setFormData({ ...formData, consentDataProcessing: e.target.checked })}
                      className="mt-0.5 rounded text-mint focus:ring-0"
                    />
                    <div>
                      <p className="text-foreground font-semibold">Consent for Underwriting Evidence Processing</p>
                      <p className="text-foreground-secondary text-[11px] mt-0.5">
                        I authorize TradeTrust to verify reported revenue against submitted bank statements and generate a zero-knowledge validity witness.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-theme cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.consentZkDisclosure}
                      onChange={(e) => setFormData({ ...formData, consentZkDisclosure: e.target.checked })}
                      className="mt-0.5 rounded text-mint focus:ring-0"
                    />
                    <div>
                      <p className="text-foreground font-semibold">Zero-Knowledge Threshold Proof Generation</p>
                      <p className="text-foreground-secondary text-[11px] mt-0.5">
                        I authorize generating a proof disclosing that revenue satisfies &gt;= $15,000/mo while keeping raw statements private.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-theme cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.consentBaseSepoliaPublish}
                      onChange={(e) => setFormData({ ...formData, consentBaseSepoliaPublish: e.target.checked })}
                      className="mt-0.5 rounded text-mint focus:ring-0"
                    />
                    <div>
                      <p className="text-foreground font-semibold">Base Sepolia Onchain Marketplace Commitment</p>
                      <p className="text-foreground-secondary text-[11px] mt-0.5">
                        I authorize publishing the request terms (Amount, Max APR, Duration, Commitment Hash) to the Base Sepolia marketplace contract.
                      </p>
                    </div>
                  </label>

                  {errors.consent && <p className="text-rose-400 text-xs">{errors.consent}</p>}
                </div>
              </div>
            )}

            {/* STEP 5: REVIEW & SUBMIT */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-fade-in">
                <div className="pb-3 border-b border-theme">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-mint" />
                    Step 5: Review & Broadcast to Marketplace
                  </h3>
                  <p className="text-xs text-foreground-secondary">
                    Verify all parameters prior to signing and submitting onchain.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-theme text-xs space-y-3 font-mono">
                  <div className="flex justify-between items-center pb-2 border-b border-theme">
                    <span className="text-foreground-secondary font-sans">Merchant:</span>
                    <span className="text-foreground font-bold">{formData.businessName}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-theme">
                    <span className="text-foreground-secondary font-sans">Requested Capital:</span>
                    <span className="text-mint font-bold text-sm">${formData.requestedAmount.toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-theme">
                    <span className="text-foreground-secondary font-sans">Term / Max APR:</span>
                    <span className="text-foreground">{formData.durationMonths} Months @ {formData.maxAcceptableApr}% APR Cap</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-theme">
                    <span className="text-foreground-secondary font-sans">ZK Eligibility Claim:</span>
                    <span className="text-emerald-400">Turnover &gt;= $15,000/mo (Private)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground-secondary font-sans">Destination Network:</span>
                    <span className="text-blue-300">Base Sepolia (Chain ID 84532)</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-mint/5 border border-mint/20 text-xs text-foreground-secondary">
                  <strong className="text-mint">Ready to Submit:</strong> Upon clicking "Submit Financing Application", an onchain request will be registered and lenders will be notified to review and submit funding offers.
                </div>
              </div>
            )}

            {/* NAVIGATION BUTTONS */}
            <div className="flex items-center justify-between pt-4 border-t border-theme">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 rounded-lg bg-surface-hover hover:bg-surface-hover text-foreground-secondary text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <Link
                  href="/app"
                  className="px-4 py-2 rounded-lg bg-surface-hover text-foreground-secondary text-xs font-semibold hover:text-foreground"
                >
                  Cancel
                </Link>
              )}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 rounded-lg bg-mint hover:bg-mint-muted text-black text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-mint to-mint-muted hover:opacity-95 text-black text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-mint/20"
                >
                  {isSubmitting ? (
                    <span>Broadcasting to Base Sepolia...</span>
                  ) : (
                    <>
                      <span>Submit Financing Application</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
