"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  Coins,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Calendar,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Lock,
  FileText,
  AlertCircle,
  Building2,
  Send,
  Loader2,
  Info,
  BadgeCheck,
  Hash
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getStore, createLenderOffer } from "@/lib/state/demoStore";
import { FinancingRequest } from "@/types";

export default function LenderRequestReviewPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = (params?.id as string) || "";
  
  const [store, setStore] = useState(getStore());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [offerSuccessTx, setOfferSuccessTx] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => setStore(getStore());
    window.addEventListener("tradetrust_store_updated", handleUpdate);
    return () => window.removeEventListener("tradetrust_store_updated", handleUpdate);
  }, []);

  const request = store.requests.find((r) => r.id === requestId) || store.requests[0];

  // Offer formulation state
  const [offerAmount, setOfferAmount] = useState(request ? request.requestedAmount : 15000);
  const [offerApr, setOfferApr] = useState(request ? Math.max(8.5, request.maxAcceptableApr - 0.7) : 10.5);
  const [offerDuration, setOfferDuration] = useState(request ? request.durationMonths : 12);
  const [originationFee, setOriginationFee] = useState(150);
  const [gracePeriodDays, setGracePeriodDays] = useState(30);
  const [covenantType, setCovenantType] = useState<"standard" | "agentic_commerce">("agentic_commerce");
  const [termsSummary, setTermsSummary] = useState(
    "Disbursement conditional on scoped inventory procurement. 30-day grace period on first principal payment. Onchain repayment schedule anchored on Base Sepolia."
  );

  // Sync state if request loads
  useEffect(() => {
    if (request) {
      setOfferAmount(request.requestedAmount);
      setOfferApr(Math.max(8.5, request.maxAcceptableApr - 0.7));
      setOfferDuration(request.durationMonths);
    }
  }, [request?.id]);

  if (!request) {
    return (
      <AppLayout>
        <div className="p-8 text-center space-y-4">
          <p className="text-foreground-secondary">Financing request not found.</p>
          <Link href="/lender/requests" className="px-4 py-2 bg-violet text-foreground rounded-lg text-xs font-bold">
            Back to Requests
          </Link>
        </div>
      </AppLayout>
    );
  }

  // Financial calculations
  const totalInterest = (offerAmount * (offerApr / 100) * offerDuration) / 12;
  const totalRepayable = offerAmount + totalInterest;
  const monthlyPayment = totalRepayable / offerDuration;
  const netDisbursement = offerAmount - originationFee;

  const handleIssueOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate onchain broadcast delay
      await new Promise((r) => setTimeout(r, 900));

      const newOffer = createLenderOffer({
        requestId: request.id,
        lenderAddress: store.lenderProfile.address,
        lenderName: store.lenderProfile.institution,
        amountOffered: offerAmount,
        interestAprBps: Math.round(offerApr * 100),
        durationMonths: offerDuration,
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalRepayable: Math.round(totalRepayable * 100) / 100,
        repaymentFrequency: "monthly",
        originationFee,
        termsSummary: `${termsSummary} [Covenant: ${covenantType.toUpperCase()}]`,
        expiresAt: Date.now() + 14 * 24 * 3600 * 1000,
      });

      setOfferSuccessTx(newOffer.baseSepoliaTxHash || "0xabcdef...");
      alert(`Funding Offer ${newOffer.id} issued and anchored to Base Sepolia!`);
    } catch (err: any) {
      alert("Error issuing offer: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-foreground-secondary">
          <Link href="/lender" className="hover:text-foreground transition-colors">
            Lender Hub
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/lender/requests" className="hover:text-foreground transition-colors">
            Merchant Requests
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-mono font-bold">{request.id}</span>
        </div>

        {/* Top Header Card */}
        <div className="p-6 rounded-2xl bg-surface-card border border-theme shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-theme">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet/20 text-violet border border-violet/30 font-bold uppercase">
                  UNDERWRITING DOSSIER
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface border border-theme text-foreground-secondary">
                  Request {request.id}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  {request.status.toUpperCase().replace("_", " ")}
                </span>
              </div>
              <h1 className="text-2xl font-black text-foreground mt-2">{request.businessName}</h1>
              <p className="text-xs text-foreground-secondary mt-1">
                {request.businessType} • {request.city}, {request.country} • Merchant Address:{" "}
                <span className="font-mono text-mint">{request.merchantAddress}</span>
              </p>
            </div>

            <div className="text-left md:text-right">
              <span className="text-xs text-foreground-secondary uppercase tracking-wider font-mono">Requested Capital</span>
              <p className="text-3xl font-black font-mono text-foreground mt-0.5">
                ${request.requestedAmount.toLocaleString()} <span className="text-xs font-normal text-foreground-secondary">USD</span>
              </p>
              <p className="text-xs font-mono text-mint mt-1">
                Tenure: {request.durationMonths} Mo • Max Acceptable APR: {request.maxAcceptableApr}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-surface border border-theme">
              <span className="text-[10px] text-foreground-secondary uppercase font-mono block">Intended Use of Capital</span>
              <p className="font-semibold text-foreground text-xs mt-1">{request.intendedUse}</p>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-theme">
              <span className="text-[10px] text-foreground-secondary uppercase font-mono block">Operating Longevity</span>
              <p className="font-semibold text-foreground text-xs mt-1">3.5 Years Continuous Trading</p>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-theme">
              <span className="text-[10px] text-foreground-secondary uppercase font-mono block">Disbursement Preference</span>
              <p className="font-semibold text-mint text-xs mt-1">Base Sepolia USDC / Agent Escrow</p>
            </div>
          </div>
        </div>

        {/* Two-Column Layout: Left = Audit Evidence & ZK Proofs, Right = Offer Desk */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Evidence & ZK Inspector (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Stated vs Verified Comparison */}
            <div className="p-6 rounded-2xl bg-surface-card border border-theme space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-theme">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-mint" />
                  <h3 className="font-bold text-sm text-foreground">Stated vs Cryptographically Proven Claims</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  VERIFIED PASSED
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-surface border border-theme flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="text-foreground-secondary block text-[11px]">Monthly Gross Revenue Claim</span>
                    <p className="text-sm font-bold text-foreground mt-0.5">Stated: $18,500.00 / month</p>
                    <p className="text-[11px] text-foreground-secondary mt-1">
                      Submitted via merchant financial reporting questionnaire.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-mint uppercase font-bold">ZK Range Proof</span>
                    <p className="text-sm font-bold text-mint mt-0.5">≥ ${request.evidenceSummary.verifiedThreshold.toLocaleString()} / mo</p>
                    <span className="text-[10px] text-foreground-muted font-mono">BN254 SNARK Validated</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface border border-theme flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="text-foreground-secondary block text-[11px]">Wholesale Evidence Integrity</span>
                    <p className="text-sm font-bold text-foreground mt-0.5">
                      {request.evidenceSummary.documentsCount} Encrypted Accounting Invoices
                    </p>
                    <p className="text-[11px] text-foreground-secondary mt-1">
                      Tamper-evident SHA-256 hash stamp anchored on Base Sepolia.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Hash Stamp</span>
                    <p className="text-xs font-mono text-slate-300 mt-0.5">SHA-256 Valid</p>
                    <span className="text-[10px] text-foreground-muted font-mono">0 Tampering Detected</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface border border-theme flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="text-foreground-secondary block text-[11px]">Privacy & Data Minimization</span>
                    <p className="text-sm font-bold text-foreground mt-0.5">Zcash Shielded Selective Disclosure</p>
                    <p className="text-[11px] text-foreground-secondary mt-1">
                      Exact customer identities and balance sheet remained encrypted offchain.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-violet uppercase font-bold">Zero PII Leaked</span>
                    <p className="text-xs font-mono text-violet mt-0.5">Shielded Trail</p>
                    <span className="text-[10px] text-foreground-muted font-mono">Compliance Passed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptographic Proof Inspector (BN254 & Poseidon) */}
            <div className="p-6 rounded-2xl bg-surface-card border border-theme space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-theme">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-violet" />
                  <h3 className="font-bold text-sm text-foreground">ZK Revenue Proof Verification Inspector</h3>
                </div>
                <span className="text-[10px] font-mono text-foreground-secondary">Curve: alt_bn128 (BN254)</span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-surface border border-theme space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-foreground-secondary">
                    <span>Poseidon Commitment Hash:</span>
                    <span className="text-mint">Poseidon(revenue, salt)</span>
                  </div>
                  <p className="text-xs text-mint break-all select-all">
                    {request.evidenceSummary.revenueCommitmentHash}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-theme space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-foreground-secondary">
                    <span>Public Inputs Array:</span>
                    <span className="text-emerald-400">Match Verifier Key</span>
                  </div>
                  <pre className="text-[11px] text-foreground-secondary bg-background p-2.5 rounded border border-theme overflow-x-auto">
{`[
  "threshold": "${request.evidenceSummary.verifiedThreshold}",
  "commitment": "${request.evidenceSummary.revenueCommitmentHash.slice(0, 16)}...",
  "nullifier": "0x4e8a109923bb67a421...",
  "timestamp": "${Math.floor(request.createdAt / 1000)}"
]`}
                  </pre>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-theme flex items-center justify-between text-xs">
                  <div>
                    <span className="text-foreground-secondary text-[11px] block">Base Sepolia Verifier Contract:</span>
                    <span className="text-foreground font-mono text-[11px]">0x192D87Fa34E2713...48B9</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    VERIFIED ONCHAIN
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Capital Offer Issuance Desk (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-surface-card border border-theme space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-theme">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-violet" />
                  <h3 className="font-bold text-sm text-foreground">Underwrite & Issue Offer</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet/20 text-violet font-bold">
                  ACTIVE DESK
                </span>
              </div>

              <form onSubmit={handleIssueOffer} className="space-y-4 text-xs">
                <div>
                  <label className="block text-foreground-secondary font-medium mb-1">
                    Financing Amount ($ USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-foreground-muted">$</span>
                    <input
                      type="number"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 rounded-lg bg-surface border border-theme text-foreground font-mono font-bold focus:outline-none focus:border-violet"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-foreground-secondary font-medium mb-1">
                      Fixed APR (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={offerApr}
                      onChange={(e) => setOfferApr(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground font-mono font-bold focus:outline-none focus:border-violet"
                    />
                  </div>

                  <div>
                    <label className="block text-foreground-secondary font-medium mb-1">
                      Duration (Months)
                    </label>
                    <input
                      type="number"
                      value={offerDuration}
                      onChange={(e) => setOfferDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground font-mono font-bold focus:outline-none focus:border-violet"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-foreground-secondary font-medium mb-1">
                      Origination Fee ($)
                    </label>
                    <input
                      type="number"
                      value={originationFee}
                      onChange={(e) => setOriginationFee(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground font-mono focus:outline-none focus:border-violet"
                    />
                  </div>

                  <div>
                    <label className="block text-foreground-secondary font-medium mb-1">
                      Grace Period (Days)
                    </label>
                    <input
                      type="number"
                      value={gracePeriodDays}
                      onChange={(e) => setGracePeriodDays(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground font-mono focus:outline-none focus:border-violet"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-foreground-secondary font-medium mb-1">
                    Spending Governance Covenant
                  </label>
                  <select
                    value={covenantType}
                    onChange={(e: any) => setCovenantType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground font-medium focus:outline-none focus:border-violet"
                  >
                    <option value="agentic_commerce">
                      Bitrefill AI Agent Whitelist (Inventory Only)
                    </option>
                    <option value="standard">
                      Unrestricted Working Capital
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-foreground-secondary font-medium mb-1">
                    Covenants & Summary Terms
                  </label>
                  <textarea
                    rows={3}
                    value={termsSummary}
                    onChange={(e) => setTermsSummary(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground focus:outline-none focus:border-violet text-xs leading-relaxed"
                  />
                </div>

                {/* Offer Summary Breakdown */}
                <div className="p-3.5 rounded-xl bg-surface border border-theme space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-foreground-secondary">
                    <span>Monthly Installment:</span>
                    <strong className="text-mint font-bold text-sm">${monthlyPayment.toFixed(2)} / mo</strong>
                  </div>
                  <div className="flex items-center justify-between text-foreground-secondary">
                    <span>Total Interest Charge:</span>
                    <span className="text-foreground">${totalInterest.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-foreground-secondary">
                    <span>Total Repayable:</span>
                    <span className="text-foreground font-bold">${totalRepayable.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-theme text-foreground-secondary">
                    <span>Net Disbursed to Merchant:</span>
                    <strong className="text-foreground">${netDisbursement.toFixed(2)}</strong>
                  </div>
                </div>

                {offerSuccessTx && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Offer Broadcast Complete!
                    </p>
                    <p className="font-mono text-[11px] truncate">
                      Tx: {offerSuccessTx}
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-violet hover:bg-violet-muted text-foreground text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing & Broadcasting to Base Sepolia...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Sign & Dispatch Offer to Merchant</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
