"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Coins,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Calendar,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  X,
  Plus,
  Loader2,
  Lock,
  FileSearch
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getStore, saveStore, createLenderOffer } from "@/lib/state/demoStore";
import { FinancingRequest, LenderOffer } from "@/types";

export default function LenderRequestsPage() {
  const [store, setStore] = useState(getStore());
  const [selectedRequest, setSelectedRequest] = useState<FinancingRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Offer Creation Form State
  const [offerAmount, setOfferAmount] = useState(12500);
  const [offerApr, setOfferApr] = useState(10.8);
  const [offerDuration, setOfferDuration] = useState(12);
  const [originationFee, setOriginationFee] = useState(125);
  const [termsSummary, setTermsSummary] = useState(
    "30-day grace period on first principal payment. Direct debit or ERC20 test-token repayment supported."
  );

  useEffect(() => {
    const handleUpdate = () => setStore(getStore());
    window.addEventListener("tradetrust_store_updated", handleUpdate);
    return () => window.removeEventListener("tradetrust_store_updated", handleUpdate);
  }, []);

  const handleOpenOfferModal = (req: FinancingRequest) => {
    setSelectedRequest(req);
    setOfferAmount(req.requestedAmount);
    setOfferDuration(req.durationMonths);
    setOfferApr(Math.min(req.maxAcceptableApr - 0.5, 11.0));
    setIsModalOpen(true);
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setIsSubmitting(true);

    try {
      const interestTotal = (offerAmount * (offerApr / 100) * offerDuration) / 12;
      const totalRepayable = offerAmount + interestTotal;
      const monthlyPayment = totalRepayable / offerDuration;

      const newOffer = createLenderOffer({
        requestId: selectedRequest.id,
        lenderAddress: store.lenderProfile.address,
        lenderName: store.lenderProfile.institution,
        amountOffered: offerAmount,
        interestAprBps: Math.round(offerApr * 100),
        durationMonths: offerDuration,
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalRepayable: Math.round(totalRepayable * 100) / 100,
        repaymentFrequency: "monthly",
        originationFee,
        termsSummary,
        expiresAt: Date.now() + 14 * 24 * 3600 * 1000,
      });

      setIsModalOpen(false);
      alert(`Offer ${newOffer.id} created and dispatched on Base Sepolia! You can now switch to Merchant view to see it in the Offer Marketplace.`);
    } catch (err: any) {
      alert("Error creating offer: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet/20 text-violet border border-violet/30 font-bold uppercase">
                UNDERWRITING DESK
              </span>
              <span className="text-xs text-foreground-secondary font-mono">Base Sepolia Market</span>
            </div>
            <h1 className="text-xl font-extrabold text-foreground mt-1">Merchant Financing Requests</h1>
            <p className="text-xs text-foreground-secondary">
              Review verified merchant turnover claims, inspect ZK proofs, and create competitive capital offers.
            </p>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {store.requests.map((req) => (
            <div
              key={req.id}
              className="p-6 rounded-2xl bg-surface-card border border-theme hover:border-violet-500/30 transition-all space-y-4 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-theme">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-foreground">{req.businessName}</h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {req.id}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-secondary mt-0.5">
                    {req.businessType} • {req.city}, {req.country} • Merchant:{" "}
                    <span className="font-mono text-foreground-secondary">{req.merchantAddress.slice(0, 8)}...{req.merchantAddress.slice(-4)}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-2xl font-black font-mono text-foreground">
                    ${req.requestedAmount.toLocaleString()} <span className="text-xs font-normal text-foreground-secondary">USD</span>
                  </p>
                  <p className="text-xs font-mono text-mint">
                    Term: {req.durationMonths} Mo • Max Cap: {req.maxAcceptableApr}% APR
                  </p>
                </div>
              </div>

              {/* Verified Evidence Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-surface border border-theme space-y-1">
                  <span className="text-[10px] text-foreground-secondary uppercase flex items-center gap-1 font-mono">
                    <Lock className="w-3 h-3 text-violet" /> ZK Revenue Verification
                  </span>
                  <p className="font-bold text-mint text-xs">
                    Satisfies &gt;= ${req.evidenceSummary.verifiedThreshold.toLocaleString()} / mo
                  </p>
                  <p className="text-[10px] text-foreground-muted font-mono truncate">
                    Commitment: {req.evidenceSummary.revenueCommitmentHash}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-theme space-y-1">
                  <span className="text-[10px] text-foreground-secondary uppercase font-mono">Offchain Evidence</span>
                  <p className="font-bold text-foreground text-xs">
                    {req.evidenceSummary.documentsCount} Invoices & Bank Statements
                  </p>
                  <p className="text-[10px] text-emerald-400 font-medium">Integrity Stamp Passed</p>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-theme space-y-1">
                  <span className="text-[10px] text-foreground-secondary uppercase font-mono">Application Status</span>
                  <p className="font-bold text-foreground text-xs uppercase font-mono">{req.status.replace("_", " ")}</p>
                  <p className="text-[10px] text-foreground-muted">Expires in 28 days</p>
                </div>
              </div>

              <p className="text-xs text-foreground-secondary leading-relaxed">
                <strong className="text-foreground">Intended Capital Deployment:</strong> {req.intendedUse}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-[11px] font-mono text-foreground-secondary">
                  <ShieldCheck className="w-3.5 h-3.5 text-mint" />
                  <span>Base Sepolia Anchor Verified</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Link
                    href={`/lender/requests/${req.id}`}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-surface border border-theme hover:bg-surface-hover text-foreground text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <FileSearch className="w-3.5 h-3.5 text-violet" />
                    <span>Audit Dossier</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleOpenOfferModal(req)}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-violet hover:bg-violet-muted text-foreground text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-violet/10"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Quick Offer</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL: DISPATCH LENDER OFFER */}
        {isModalOpen && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-lg rounded-2xl bg-surface-card border border-theme shadow-2xl p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-theme">
                <div>
                  <h3 className="font-bold text-base text-foreground">Create & Dispatch Funding Offer</h3>
                  <p className="text-xs text-foreground-secondary">Recipient: {selectedRequest.businessName}</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded text-foreground-secondary hover:text-foreground hover:bg-surface"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateOffer} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-foreground-secondary font-medium mb-1">Capital Amount ($ USD)</label>
                    <input
                      type="number"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground font-mono font-bold focus:outline-none focus:border-violet"
                    />
                  </div>

                  <div>
                    <label className="block text-foreground-secondary font-medium mb-1">Annualized APR (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={offerApr}
                      onChange={(e) => setOfferApr(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground font-mono font-bold focus:outline-none focus:border-violet"
                    />
                  </div>

                  <div>
                    <label className="block text-foreground-secondary font-medium mb-1">Duration (Months)</label>
                    <input
                      type="number"
                      value={offerDuration}
                      onChange={(e) => setOfferDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground font-mono focus:outline-none focus:border-violet"
                    />
                  </div>

                  <div>
                    <label className="block text-foreground-secondary font-medium mb-1">Origination Fee ($)</label>
                    <input
                      type="number"
                      value={originationFee}
                      onChange={(e) => setOriginationFee(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground font-mono focus:outline-none focus:border-violet"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-foreground-secondary font-medium mb-1">Terms & Conditions Summary</label>
                  <textarea
                    rows={2}
                    value={termsSummary}
                    onChange={(e) => setTermsSummary(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground focus:outline-none focus:border-violet text-xs leading-relaxed"
                  />
                </div>

                <div className="p-3 rounded-xl bg-surface border border-theme space-y-1 font-mono text-[11px]">
                  <p className="text-foreground-secondary">
                    Estimated Monthly Installment:{" "}
                    <strong className="text-mint">
                      ${(((offerAmount + (offerAmount * (offerApr / 100) * offerDuration) / 12) / offerDuration)).toFixed(2)} / mo
                    </strong>
                  </p>
                  <p className="text-foreground-secondary">
                    Total Repayable:{" "}
                    <strong className="text-foreground">
                      ${(offerAmount + (offerAmount * (offerApr / 100) * offerDuration) / 12).toFixed(2)} USD
                    </strong>
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-theme">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-surface hover:bg-surface-hover text-foreground-secondary font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-lg bg-violet hover:bg-violet-muted text-foreground font-bold flex items-center gap-2 shadow-md shadow-violet/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Broadcasting to Base Sepolia...</span>
                      </>
                    ) : (
                      <>
                        <Coins className="w-3.5 h-3.5" />
                        <span>Sign & Dispatch Offer</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
