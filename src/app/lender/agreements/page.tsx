"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileCheck,
  Coins,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Calendar,
  ExternalLink,
  ChevronRight,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Download,
  AlertTriangle,
  Building2,
  Lock,
  Layers
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getStore } from "@/lib/state/demoStore";

export default function LenderAgreementsPage() {
  const [store, setStore] = useState(getStore());
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [selectedAgreement, setSelectedAgreement] = useState<any | null>(null);

  useEffect(() => {
    const handleUpdate = () => setStore(getStore());
    window.addEventListener("tradetrust_store_updated", handleUpdate);
    return () => window.removeEventListener("tradetrust_store_updated", handleUpdate);
  }, []);

  // Accepted offers represent executed financing agreements
  const acceptedOffers = store.offers.filter((o) => o.status === "accepted");

  // Synthetic portfolio agreement entries based on accepted offers or demo defaults
  const agreements = acceptedOffers.length > 0
    ? acceptedOffers.map((o, idx) => {
        const req = store.requests.find((r) => r.id === o.requestId);
        const paidAmount = o.monthlyPayment * 2; // Demo: 2 installments paid
        const remaining = Math.max(0, o.totalRepayable - paidAmount);
        const progressPct = Math.min(100, Math.round((paidAmount / o.totalRepayable) * 100));

        return {
          id: `AGR-2026-${100 + idx}`,
          offerId: o.id,
          requestId: o.requestId,
          merchantName: req?.businessName || store.merchantProfile.businessName,
          merchantAddress: req?.merchantAddress || store.merchantProfile.walletAddress,
          businessType: req?.businessType || store.merchantProfile.businessType,
          principal: o.amountOffered,
          apr: o.interestAprBps / 100,
          durationMonths: o.durationMonths,
          monthlyPayment: o.monthlyPayment,
          totalRepayable: o.totalRepayable,
          totalPaid: paidAmount,
          remainingBalance: remaining,
          progressPct,
          nextDueDate: "Nov 15, 2026",
          status: remaining <= 0 ? "completed" : "active",
          agreementTx: o.baseSepoliaTxHash || "0x9812739a8bc434df89240801824701235478413a388147814b7858c491e0a294",
          contractAddress: "0x892a7F4537B4660B5Bf49a40a8523c061Ec3911a",
          covenants: o.termsSummary,
          disbursedAt: "Oct 15, 2026",
        };
      })
    : [
        {
          id: "AGR-2026-001",
          offerId: "OFF-2026-001",
          requestId: "REQ-2026-001",
          merchantName: "Amina Fashion Boutique & Textiles",
          merchantAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          businessType: "Apparel & Retail Distribution",
          principal: 12500,
          apr: 10.8,
          durationMonths: 12,
          monthlyPayment: 1154.17,
          totalRepayable: 13850,
          totalPaid: 2308.34,
          remainingBalance: 11541.66,
          progressPct: 17,
          nextDueDate: "Nov 15, 2026",
          status: "active",
          agreementTx: "0x9812739a8bc434df89240801824701235478413a388147814b7858c491e0a294",
          contractAddress: "0x892a7F4537B4660B5Bf49a40a8523c061Ec3911a",
          covenants: "Inventory procurement whitelisted through Bitrefill AI Agent. 30-day grace period.",
          disbursedAt: "Oct 15, 2026",
        },
        {
          id: "AGR-2026-002",
          offerId: "OFF-2026-002",
          requestId: "REQ-2026-002",
          merchantName: "Nairobi Hardware & Electronics Hub",
          merchantAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
          businessType: "Industrial Electronics & Hardware",
          principal: 20000,
          apr: 11.2,
          durationMonths: 12,
          monthlyPayment: 1853.33,
          totalRepayable: 22240,
          totalPaid: 5560.00,
          remainingBalance: 16680.00,
          progressPct: 25,
          nextDueDate: "Nov 20, 2026",
          status: "active",
          agreementTx: "0x44fa781039840182a93817498701928340182740918237409182374091823740",
          contractAddress: "0x892a7F4537B4660B5Bf49a40a8523c061Ec3911a",
          covenants: "Hardware replenishment via verified supplier trust network.",
          disbursedAt: "Sep 20, 2026",
        }
      ];

  const filteredAgreements = agreements.filter((a) => {
    if (filter === "all") return true;
    return a.status === filter;
  });

  const totalDeployed = agreements.reduce((sum, a) => sum + a.principal, 0);
  const totalRecovered = agreements.reduce((sum, a) => sum + a.totalPaid, 0);
  const totalOutstanding = agreements.reduce((sum, a) => sum + a.remainingBalance, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet/20 text-violet border border-violet/30 font-bold uppercase">
                PORTFOLIO MONITOR
              </span>
              <span className="text-xs text-foreground-secondary font-mono">Base Sepolia Contract Registry</span>
            </div>
            <h1 className="text-xl font-extrabold text-foreground mt-1">Active Financing Agreements</h1>
            <p className="text-xs text-foreground-secondary">
              Track executed working-capital contracts, principal disbursements, and onchain repayment progress.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/lender/repayments"
              className="px-3.5 py-2 rounded-lg bg-surface border border-theme hover:bg-surface-hover text-foreground text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-mint" />
              <span>Repayment Ledger</span>
            </Link>
            <Link
              href="/lender/requests"
              className="px-3.5 py-2 rounded-lg bg-violet hover:bg-violet-muted text-foreground text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-violet/10"
            >
              <span>Underwrite New Request</span>
            </Link>
          </div>
        </div>

        {/* Portfolio KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-1">
            <span className="text-xs text-foreground-secondary uppercase tracking-wider font-mono">Active Agreements</span>
            <p className="text-2xl font-black font-mono text-foreground">{agreements.length}</p>
            <p className="text-[11px] text-foreground-muted font-mono">100% On-Time Performance</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-1">
            <span className="text-xs text-foreground-secondary uppercase tracking-wider font-mono">Total Capital Deployed</span>
            <p className="text-2xl font-black font-mono text-foreground">${totalDeployed.toLocaleString()}</p>
            <p className="text-[11px] text-foreground-muted font-mono">Principal Disbursed</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-1">
            <span className="text-xs text-foreground-secondary uppercase tracking-wider font-mono">Principal Recovered</span>
            <p className="text-2xl font-black font-mono text-mint">${totalRecovered.toLocaleString()}</p>
            <p className="text-[11px] text-mint font-mono">22.4% Capital Returned</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-1">
            <span className="text-xs text-foreground-secondary uppercase tracking-wider font-mono">Remaining Exposure</span>
            <p className="text-2xl font-black font-mono text-violet">${totalOutstanding.toLocaleString()}</p>
            <p className="text-[11px] text-foreground-muted font-mono">Secured by Onchain Escrow</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === "all"
                ? "bg-violet text-foreground shadow-sm shadow-violet/20"
                : "bg-surface border border-theme text-foreground-secondary hover:text-foreground"
            }`}
          >
            All Agreements ({agreements.length})
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === "active"
                ? "bg-violet text-foreground shadow-sm shadow-violet/20"
                : "bg-surface border border-theme text-foreground-secondary hover:text-foreground"
            }`}
          >
            Active Performing
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === "completed"
                ? "bg-violet text-foreground shadow-sm shadow-violet/20"
                : "bg-surface border border-theme text-foreground-secondary hover:text-foreground"
            }`}
          >
            Fully Settled
          </button>
        </div>

        {/* Agreements Grid */}
        <div className="space-y-4">
          {filteredAgreements.map((agr) => (
            <div
              key={agr.id}
              className="p-6 rounded-2xl bg-surface-card border border-theme hover:border-violet-500/30 transition-all space-y-4 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-theme">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-foreground">{agr.merchantName}</h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-violet/20 text-violet border border-violet/30 font-bold">
                      {agr.id}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                      {agr.status}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-secondary mt-0.5">
                    {agr.businessType} • Merchant Address:{" "}
                    <span className="font-mono text-mint">{agr.merchantAddress.slice(0, 8)}...{agr.merchantAddress.slice(-4)}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-2xl font-black font-mono text-foreground">
                    ${agr.principal.toLocaleString()} <span className="text-xs font-normal text-foreground-secondary">Principal</span>
                  </p>
                  <p className="text-xs font-mono text-mint">
                    {agr.apr}% APR • {agr.durationMonths} Mo Tenure
                  </p>
                </div>
              </div>

              {/* Progress and Financial Metrics */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-foreground-secondary">
                    Repayment Progress: <strong className="text-foreground">${agr.totalPaid.toLocaleString()}</strong> of ${agr.totalRepayable.toLocaleString()}
                  </span>
                  <span className="text-mint font-bold">{agr.progressPct}% Paid</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface border border-theme overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-mint to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${agr.progressPct}%` }}
                  />
                </div>
              </div>

              {/* Installment details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-surface border border-theme space-y-0.5 font-mono">
                  <span className="text-[10px] text-foreground-secondary uppercase">Monthly Due</span>
                  <p className="text-sm font-bold text-foreground">${agr.monthlyPayment.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-xl bg-surface border border-theme space-y-0.5 font-mono">
                  <span className="text-[10px] text-foreground-secondary uppercase">Next Due Date</span>
                  <p className="text-sm font-bold text-mint">{agr.nextDueDate}</p>
                </div>
                <div className="p-3 rounded-xl bg-surface border border-theme space-y-0.5 font-mono">
                  <span className="text-[10px] text-foreground-secondary uppercase">Outstanding Balance</span>
                  <p className="text-sm font-bold text-foreground">${agr.remainingBalance.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-xl bg-surface border border-theme space-y-0.5 font-mono">
                  <span className="text-[10px] text-foreground-secondary uppercase">Disbursement Date</span>
                  <p className="text-sm font-bold text-foreground-secondary">{agr.disbursedAt}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-theme text-xs text-foreground-secondary space-y-1">
                <p className="font-semibold text-foreground text-[11px] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-violet" />
                  <span>Covenants & Spending Restrictions:</span>
                </p>
                <p className="text-[11px] leading-relaxed">{agr.covenants}</p>
              </div>

              {/* Actions footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3 text-[11px] font-mono text-foreground-secondary">
                  <a
                    href={`https://sepolia-explorer.base.org/tx/${agr.agreementTx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mint hover:underline flex items-center gap-1"
                  >
                    <span>Agreement BaseScan Tx</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span>•</span>
                  <span>Contract: {agr.contractAddress.slice(0, 10)}...</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedAgreement(agr)}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-surface border border-theme hover:bg-surface-hover text-foreground text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>View Agreement Dossier</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href="/lender/repayments"
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-violet hover:bg-violet-muted text-foreground text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-violet/10"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Audit Installments</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL: AGREEMENT DOSSIER */}
        {selectedAgreement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-lg rounded-2xl bg-surface-card border border-theme shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-theme">
                <div>
                  <h3 className="font-bold text-base text-foreground">Agreement Contract Dossier</h3>
                  <p className="text-xs text-foreground-secondary font-mono">{selectedAgreement.id}</p>
                </div>
                <button
                  onClick={() => setSelectedAgreement(null)}
                  className="px-2.5 py-1 rounded bg-surface hover:bg-surface-hover text-foreground text-xs"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-surface border border-theme space-y-1">
                  <span className="text-[10px] text-foreground-secondary uppercase">Counterparty Merchant</span>
                  <p className="font-sans font-bold text-foreground text-sm">{selectedAgreement.merchantName}</p>
                  <p className="text-mint text-[11px] break-all">{selectedAgreement.merchantAddress}</p>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-theme space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Original Principal:</span>
                    <strong className="text-foreground">${selectedAgreement.principal.toLocaleString()} USD</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Annualized Fixed APR:</span>
                    <strong className="text-mint">{selectedAgreement.apr}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Monthly Payment:</span>
                    <strong className="text-foreground">${selectedAgreement.monthlyPayment.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Repaid to Date:</span>
                    <strong className="text-emerald-400">${selectedAgreement.totalPaid.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Outstanding Principal:</span>
                    <strong className="text-violet">${selectedAgreement.remainingBalance.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-theme space-y-1">
                  <span className="text-[10px] text-foreground-secondary uppercase">Onchain Agreement Contract</span>
                  <p className="text-mint text-[11px] break-all">{selectedAgreement.contractAddress}</p>
                  <p className="text-foreground-secondary text-[10px]">Governed by TradeTrust Core Financing Agreement v2.1</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-theme">
                <button
                  onClick={() => setSelectedAgreement(null)}
                  className="px-4 py-2 rounded-lg bg-surface hover:bg-surface-hover text-foreground text-xs font-bold"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
