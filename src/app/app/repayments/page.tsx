"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  DollarSign,
  TrendingUp,
  CreditCard,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Send,
  RotateCcw,
  Bot,
  Zap,
  Sliders,
  Check
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getStore, recordRepayment, submitCounterOffer } from "@/lib/state/demoStore";
import { useWallet } from "@/context/WalletContext";
import { FinancingAgreement, RepaymentInstallment } from "@/types";

export default function MerchantRepaymentsPage() {
  const [store, setStore] = useState(getStore());
  const { isConnected, address } = useWallet();

  const [selectedAgreement, setSelectedAgreement] = useState<FinancingAgreement | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [negotiateModalOpen, setNegotiateModalOpen] = useState(false);
  const [payingInstallment, setPayingInstallment] = useState<RepaymentInstallment | null>(null);
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState<string | null>(null);

  // Negotiation state
  const [proposedApr, setProposedApr] = useState(9.5);
  const [proposedDuration, setProposedDuration] = useState(14);
  const [negotiationNote, setNegotiationNote] = useState("");
  const [negotiationSuccess, setNegotiationSuccess] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      const s = getStore();
      setStore(s);
      if (s.agreements.length > 0) {
        setSelectedAgreement(s.agreements[0]);
      }
    };
    handleUpdate();
    window.addEventListener("tradetrust_store_updated", handleUpdate);
    return () => window.removeEventListener("tradetrust_store_updated", handleUpdate);
  }, []);

  const activeAgreement = selectedAgreement || store.agreements[0];
  const pendingInstallments = activeAgreement?.repayments.filter((r) => r.status === "pending" || r.status === "overdue") || [];
  const nextDueInstallment = pendingInstallments[0];
  const paidInstallments = activeAgreement?.repayments.filter((r) => r.status === "paid") || [];

  const handleMakePayment = async () => {
    if (!activeAgreement || !nextDueInstallment) return;
    setIsProcessingPay(true);

    setTimeout(() => {
      const dummyTx = "0x" + Math.random().toString(16).substring(2, 66);
      const ok = recordRepayment(activeAgreement.id, nextDueInstallment.amountDue, dummyTx, "Merchant Direct Repayment via Base Sepolia");

      setIsProcessingPay(false);
      if (ok) {
        setPaySuccessMsg(`Successfully repaid $${nextDueInstallment.amountDue.toFixed(2)} on Base Sepolia! Tx: ${dummyTx.slice(0, 10)}...`);
        setPayModalOpen(false);
        setTimeout(() => setPaySuccessMsg(null), 5000);
      }
    }, 1200);
  };

  const handleSendCounterOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!store.offers[0]) return;

    submitCounterOffer(store.offers[0].id, Number(proposedApr), Number(proposedDuration), negotiationNote || "Requesting slight APR reduction given verified on-time track record.");
    setNegotiationSuccess(true);
    setTimeout(() => {
      setNegotiationSuccess(false);
      setNegotiateModalOpen(false);
    }, 2000);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-theme">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-mint/10 text-mint border border-mint/20 font-bold uppercase">
                REPAYMENT LEDGER
              </span>
              <span className="text-xs text-foreground-secondary font-mono">Base Sepolia Lifecycle</span>
            </div>
            <h1 className="text-xl font-extrabold text-foreground mt-1">Merchant Repayment Management</h1>
            <p className="text-xs text-foreground-secondary">
              Track upcoming installment obligations, execute repayments on Base Sepolia, and access AI negotiation tools.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setNegotiateModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-hover border border-theme text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Bot className="w-3.5 h-3.5 text-violet" />
              <span>Negotiation Agent</span>
            </button>

            {nextDueInstallment && (
              <button
                onClick={() => {
                  setPayingInstallment(nextDueInstallment);
                  setPayModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-mint hover:bg-mint-muted text-black font-bold text-xs transition-all flex items-center gap-1.5 shadow-mint-sm"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay Next Installment (${nextDueInstallment.amountDue.toFixed(2)})</span>
              </button>
            )}
          </div>
        </div>

        {/* Success Alert */}
        {paySuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{paySuccessMsg}</span>
          </div>
        )}

        {/* Key Summary Metric Cards */}
        {activeAgreement ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-1.5">
              <div className="flex items-center justify-between text-xs text-foreground-secondary">
                <span>Principal Disbursed</span>
                <DollarSign className="w-4 h-4 text-mint" />
              </div>
              <p className="text-2xl font-black font-mono text-foreground">${activeAgreement.principalAmount.toLocaleString()}</p>
              <p className="text-[11px] text-foreground-muted font-mono">{activeAgreement.merchantName}</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-1.5">
              <div className="flex items-center justify-between text-xs text-foreground-secondary">
                <span>Total Repaid</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black font-mono text-foreground">${activeAgreement.totalRepaid.toLocaleString()}</p>
              <div className="w-full h-1.5 rounded-full bg-surface overflow-hidden mt-1">
                <div
                  className="h-full bg-mint rounded-full transition-all"
                  style={{ width: `${Math.min(100, (activeAgreement.totalRepaid / activeAgreement.totalRepayable) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-1.5">
              <div className="flex items-center justify-between text-xs text-foreground-secondary">
                <span>Next Installment Due</span>
                <Calendar className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black font-mono text-foreground">
                ${nextDueInstallment ? nextDueInstallment.amountDue.toFixed(2) : "0.00"}
              </p>
              <p className="text-[11px] text-amber-400 font-mono">
                {nextDueInstallment ? "Due in 11 days (On Schedule)" : "All installments complete"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-1.5">
              <div className="flex items-center justify-between text-xs text-foreground-secondary">
                <span>Outstanding Balance</span>
                <Clock className="w-4 h-4 text-violet" />
              </div>
              <p className="text-2xl font-black font-mono text-foreground">
                ${Math.max(0, activeAgreement.totalRepayable - activeAgreement.totalRepaid).toFixed(2)}
              </p>
              <p className="text-[11px] text-foreground-muted font-mono">
                APR: {(activeAgreement.interestAprBps / 100).toFixed(1)}% Fixed
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-surface-card border border-theme text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-mint mx-auto" />
            <h3 className="text-base font-bold text-foreground">No Active Debt Obligations</h3>
            <p className="text-xs text-foreground-secondary max-w-md mx-auto">
              Your business has no outstanding debt. Explore financing offers or submit a working-capital request.
            </p>
            <Link
              href="/app/apply"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-mint text-black font-bold text-xs"
            >
              <span>Apply for Working Capital</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Two-Column: Installment Schedule & AI Assistant */}
        {activeAgreement && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Installment Table */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 rounded-2xl bg-surface-card border border-theme space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-theme">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Amortization & Payment Schedule</h3>
                    <p className="text-xs text-foreground-secondary">
                      Agreement ID: <span className="font-mono text-foreground">{activeAgreement.id}</span> • Lender:{" "}
                      <span className="text-foreground font-semibold">{activeAgreement.lenderName}</span>
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                    {activeAgreement.status}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-theme text-foreground-muted text-[10px] uppercase tracking-wider">
                        <th className="py-2.5 px-3">Inst. #</th>
                        <th className="py-2.5 px-3">Due Date</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-theme">
                      {activeAgreement.repayments.map((inst) => (
                        <tr key={inst.id} className="hover:bg-surface/50 transition-colors">
                          <td className="py-3 px-3 font-bold text-foreground">#{inst.installmentNumber}</td>
                          <td className="py-3 px-3 text-foreground-secondary">
                            {new Date(inst.dueDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3 font-bold text-foreground">${inst.amountDue.toFixed(2)}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                inst.status === "paid"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : inst.status === "overdue"
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              }`}
                            >
                              {inst.status}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {inst.status === "paid" ? (
                              <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                                <Check className="w-3.5 h-3.5" /> Paid
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  setPayingInstallment(inst);
                                  setPayModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-surface hover:bg-surface-hover border border-theme text-foreground text-[11px] font-semibold"
                              >
                                Pay Now
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right: Repayment Assistant & Cash-Flow Warning */}
            <div className="space-y-4">
              {/* Cash-Flow Health Card */}
              <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-mint/10 text-mint flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-foreground">Cash-Flow Health Check</h4>
                    <p className="text-[10px] text-foreground-muted">Repayment Affordability Index</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-surface border border-theme space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Monthly Net Margin:</span>
                    <span className="font-bold font-mono text-foreground">$8,300.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Debt Service:</span>
                    <span className="font-bold font-mono text-mint">$462.50 / mo</span>
                  </div>
                  <div className="flex justify-between border-t border-theme pt-1">
                    <span className="text-foreground-secondary">Coverage Ratio (DSCR):</span>
                    <span className="font-bold font-mono text-emerald-400">17.9x (Strong)</span>
                  </div>
                </div>

                <p className="text-[11px] text-foreground-secondary leading-relaxed">
                  Your store generates sufficient free cash flow to service obligations with zero projected shortfall.
                </p>

                <Link
                  href="/app/stress-test"
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-theme text-foreground text-xs font-semibold transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-mint" />
                  <span>Run Stress Test Simulation</span>
                </Link>
              </div>

              {/* Repayment Assistant Card */}
              <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-violet/10 text-violet flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-foreground">Repayment Assistant</h4>
                    <p className="text-[10px] text-foreground-muted">Proactive Advisory Agent</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-surface border border-theme text-xs text-foreground-secondary leading-relaxed">
                  "Upcoming payment #10 of $462.50 is scheduled for next week. An on-time payment will increase your Portable Repayment Track Record score from 9/9 to 10/10."
                </div>

                <button
                  onClick={() => setNegotiateModalOpen(true)}
                  className="w-full py-2 rounded-lg bg-surface hover:bg-surface-hover border border-theme text-foreground text-xs font-semibold"
                >
                  Request Terms Modification / Deferral
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pay Modal */}
      {payModalOpen && payingInstallment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-surface-card border border-theme shadow-2xl p-6 text-foreground">
            <h3 className="text-base font-bold text-foreground">Execute Installment Repayment</h3>
            <p className="text-xs text-foreground-secondary mt-1">
              Repay Installment #{payingInstallment.installmentNumber} for Agreement {activeAgreement?.id}
            </p>

            <div className="my-5 p-4 rounded-xl bg-surface border border-theme space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Amount Due:</span>
                <span className="font-bold text-foreground">${payingInstallment.amountDue.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Target Network:</span>
                <span className="text-mint font-bold">Base Sepolia (84532)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Settlement Contract:</span>
                <span className="text-foreground">FinancingAgreementLifecycle.sol</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPayModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-theme text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMakePayment}
                disabled={isProcessingPay}
                className="flex-1 py-2.5 rounded-xl bg-mint hover:bg-mint-muted text-black font-bold text-xs disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessingPay ? "Confirming on Base..." : `Confirm Payment ($${payingInstallment.amountDue.toFixed(2)})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Negotiation & Counteroffer Modal */}
      {negotiateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface-card border border-theme shadow-2xl p-6 text-foreground">
            <div className="flex items-center justify-between pb-3 border-b border-theme mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Bot className="w-4 h-4 text-violet" />
                  Repayment Negotiation & Counteroffer
                </h3>
                <p className="text-xs text-foreground-secondary">
                  Propose modified terms, deferrals, or restructuring to participating lenders.
                </p>
              </div>
              <button onClick={() => setNegotiateModalOpen(false)} className="text-foreground-secondary hover:text-foreground">
                ✕
              </button>
            </div>

            {negotiationSuccess && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Counteroffer proposal dispatched to lender portal!</span>
              </div>
            )}

            <form onSubmit={handleSendCounterOffer} className="space-y-4 text-xs">
              <div>
                <label className="block text-foreground-secondary mb-1">Target Interest APR (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={proposedApr}
                  onChange={(e) => setProposedApr(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground font-mono focus:outline-none focus:border-mint"
                />
              </div>

              <div>
                <label className="block text-foreground-secondary mb-1">Proposed Repayment Duration (Months)</label>
                <input
                  type="number"
                  value={proposedDuration}
                  onChange={(e) => setProposedDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground font-mono focus:outline-none focus:border-mint"
                />
              </div>

              <div>
                <label className="block text-foreground-secondary mb-1">Commercial Justification & Merchant Note</label>
                <textarea
                  rows={3}
                  value={negotiationNote}
                  onChange={(e) => setNegotiationNote(e.target.value)}
                  placeholder="Explain why this adjustment benefits both parties (e.g., increased wholesale inventory order, seasonal cash turnaround)..."
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground focus:outline-none focus:border-mint text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-surface border border-theme text-[11px] text-foreground-secondary leading-relaxed">
                <strong className="text-foreground">Transparency Guarantee:</strong> Counteroffers do not modify signed contracts until approved by both parties.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNegotiateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-theme text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-mint hover:bg-mint-muted text-black font-bold text-xs shadow-mint-sm"
                >
                  Submit Counteroffer to Lender
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
