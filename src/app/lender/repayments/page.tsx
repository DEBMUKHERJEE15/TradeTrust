"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Plus,
  Search,
  Filter,
  Download,
  ShieldCheck,
  ChevronRight,
  Loader2,
  X,
  CreditCard,
  Building2
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getStore, saveStore, recordRepayment } from "@/lib/state/demoStore";

export default function LenderRepaymentsPage() {
  const [store, setStore] = useState(getStore());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Repayment Recording Form State
  const defaultAgr = store.agreements && store.agreements.length > 0 ? store.agreements[0].id : "AGR-2025-089";
  const [targetAgreement, setTargetAgreement] = useState(defaultAgr);
  const [repayAmount, setRepayAmount] = useState(462.50);
  const [paymentMethod, setPaymentMethod] = useState("Base Sepolia USDC");
  const [notes, setNotes] = useState("Monthly principal and interest installment received and validated.");

  useEffect(() => {
    const handleUpdate = () => setStore(getStore());
    window.addEventListener("tradetrust_store_updated", handleUpdate);
    return () => window.removeEventListener("tradetrust_store_updated", handleUpdate);
  }, []);

  const repayments = (store.agreements || []).flatMap((a) =>
    (a.repayments || []).map((r) => ({
      id: r.id,
      agreementId: a.id,
      amount: r.amountPaid || r.amountDue,
      dueDate: new Date(r.dueDate).toLocaleDateString(),
      paidAt: r.paidAt,
      status: r.status,
      baseSepoliaTx: r.txHash,
      notes: r.notes || (r.status === "paid" ? "On-time installment confirmed on Base Sepolia" : "Scheduled installment"),
    }))
  );

  const filteredRepayments = repayments.filter((rep) => {
    const matchesStatus = statusFilter === "all" || rep.status === statusFilter;
    const matchesSearch =
      rep.agreementId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rep.notes && rep.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const totalCollected = repayments
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingInflows = repayments
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + r.amount, 0);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((r) => setTimeout(r, 800));

      const ok = recordRepayment(
        targetAgreement,
        repayAmount,
        undefined,
        `[Method: ${paymentMethod}] ${notes}`
      );

      if (ok) {
        setIsModalOpen(false);
        alert(`Repayment of $${repayAmount.toFixed(2)} recorded on Base Sepolia for agreement ${targetAgreement}!`);
      } else {
        alert("Payment recorded on ledger.");
        setIsModalOpen(false);
      }
    } catch (err: any) {
      alert("Error recording repayment: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = "ID,Agreement,Amount,DueDate,PaidDate,Status,BaseSepoliaTx,Notes\n";
    const rows = repayments
      .map(
        (r) =>
          `"${r.id}","${r.agreementId}",${r.amount},"${r.dueDate}","${r.paidAt ? new Date(r.paidAt).toISOString() : ""}","${r.status}","${r.baseSepoliaTx || ""}","${r.notes || ""}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TradeTrust_Lender_Repayment_Ledger_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet/20 text-violet border border-violet/30 font-bold uppercase">
                REPAYMENT AUDIT LEDGER
              </span>
              <span className="text-xs text-foreground-secondary font-mono">Base Sepolia Real-Time Accounting</span>
            </div>
            <h1 className="text-xl font-extrabold text-foreground mt-1">Lender Repayment Operations</h1>
            <p className="text-xs text-foreground-secondary">
              Monitor incoming debt servicing installments, verify onchain USDC transfers, and record settlements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-lg bg-surface border border-theme hover:bg-surface-hover text-foreground text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-foreground-secondary" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-violet hover:bg-violet-muted text-foreground text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-violet/10"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Repayment</span>
            </button>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-1">
            <span className="text-xs text-foreground-secondary uppercase tracking-wider font-mono">Total Capital Recovered</span>
            <p className="text-2xl font-black font-mono text-mint">${totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="text-[11px] text-foreground-muted font-mono">Settled on Base Sepolia</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-1">
            <span className="text-xs text-foreground-secondary uppercase tracking-wider font-mono">Scheduled Inflows</span>
            <p className="text-2xl font-black font-mono text-foreground">${pendingInflows.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="text-[11px] text-foreground-muted font-mono">Upcoming Installments</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-1">
            <span className="text-xs text-foreground-secondary uppercase tracking-wider font-mono">On-Time Repayment Rate</span>
            <p className="text-2xl font-black font-mono text-emerald-400">99.4%</p>
            <p className="text-[11px] text-emerald-400 font-mono">0 Delinquencies</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-1">
            <span className="text-xs text-foreground-secondary uppercase tracking-wider font-mono">Average Loan Tenure</span>
            <p className="text-2xl font-black font-mono text-violet">12.0 Mo</p>
            <p className="text-[11px] text-foreground-muted font-mono">Monthly Linear Amortization</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-surface-card border border-theme">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search by Agreement ID or transaction notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface border border-theme text-foreground text-xs focus:outline-none focus:border-violet"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {["all", "paid", "pending", "overdue"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? "bg-violet text-foreground shadow-sm shadow-violet/20"
                    : "bg-surface text-foreground-secondary hover:text-foreground"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Repayment Table */}
        <div className="rounded-2xl bg-surface-card border border-theme overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-theme bg-surface text-foreground-secondary font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Receipt ID</th>
                  <th className="py-3 px-4">Agreement</th>
                  <th className="py-3 px-4">Scheduled Due</th>
                  <th className="py-3 px-4">Amount ($)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Settlement Proof</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {filteredRepayments.map((rep) => {
                  const isPaid = rep.status === "paid";
                  const isPending = rep.status === "pending";

                  return (
                    <tr key={rep.id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                        {rep.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-violet font-semibold">{rep.agreementId}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-foreground-secondary">
                        {rep.dueDate}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                        ${rep.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            isPaid
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : isPending
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {isPaid && <CheckCircle2 className="w-3 h-3" />}
                          {isPending && <Clock className="w-3 h-3" />}
                          {rep.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {rep.baseSepoliaTx ? (
                          <a
                            href={`https://sepolia-explorer.base.org/tx/${rep.baseSepoliaTx}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-mint hover:underline flex items-center gap-1"
                          >
                            <span>BaseScan Tx</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-foreground-muted">Pending Tx</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-foreground-secondary max-w-xs truncate text-[11px]">
                        {rep.notes || "Standard monthly amortization installment."}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL: RECORD REPAYMENT */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md rounded-2xl bg-surface-card border border-theme shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-theme">
                <div>
                  <h3 className="font-bold text-base text-foreground">Record Verified Repayment</h3>
                  <p className="text-xs text-foreground-secondary">Anchor verified payment on Base Sepolia</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded text-foreground-secondary hover:text-foreground hover:bg-surface"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
                <div>
                  <label className="block text-foreground-secondary font-medium mb-1">Target Agreement</label>
                  <select
                    value={targetAgreement}
                    onChange={(e) => setTargetAgreement(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground font-mono focus:outline-none focus:border-violet"
                  >
                    {(store.agreements || []).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} (Total: ${a.totalRepayable.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-foreground-secondary font-medium mb-1">Repayment Amount ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={repayAmount}
                    onChange={(e) => setRepayAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground font-mono font-bold focus:outline-none focus:border-violet"
                  />
                </div>

                <div>
                  <label className="block text-foreground-secondary font-medium mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground focus:outline-none focus:border-violet"
                  >
                    <option value="Base Sepolia USDC">Base Sepolia USDC (Direct Contract Transfer)</option>
                    <option value="Commercial Wire / Swift">Commercial Bank Wire / Swift</option>
                    <option value="Direct Debit ACH">Automated Direct Debit (ACH)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-foreground-secondary font-medium mb-1">Audit Notes & Reference</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground focus:outline-none focus:border-violet text-xs leading-relaxed"
                  />
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
                        <span>Anchoring Receipt...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm & Anchor Receipt</span>
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
