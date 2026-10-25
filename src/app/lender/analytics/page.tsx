"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  PieChart,
  BarChart3,
  Coins,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Calendar,
  Download,
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
  Layers,
  Lock,
  Building2,
  AlertCircle
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getStore } from "@/lib/state/demoStore";

export default function LenderAnalyticsPage() {
  const [store, setStore] = useState(getStore());
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "1y" | "all">("90d");

  useEffect(() => {
    const handleUpdate = () => setStore(getStore());
    window.addEventListener("tradetrust_store_updated", handleUpdate);
    return () => window.removeEventListener("tradetrust_store_updated", handleUpdate);
  }, []);

  const handleExportJSON = () => {
    const reportData = {
      lender: store.lenderProfile,
      portfolioSummary: {
        totalCapitalAvailable: store.lenderProfile.totalCapitalAvailable,
        activeDeployments: store.lenderProfile.activeDeployments,
        blendedApr: 11.4,
        historicalDefaultRate: 0.0,
        realizedNetIrr: 10.9,
        activeAgreementsCount: store.offers.filter((o) => o.status === "accepted").length,
      },
      requestsUnderwritten: store.requests.length,
      offersDispatched: store.offers.length,
      exportedAt: new Date().toISOString(),
      governingNetwork: "Base Sepolia (Chain ID 84532)",
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TradeTrust_Lender_Analytics_Report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = "Category,AllocationPct,DeployedAmountUSD,RiskRating,AvgApr\n";
    const rows = [
      `"Apparel & Retail Distribution",38,32300,"Low (DSCR 1.85x)",10.8`,
      `"Industrial Electronics & Hardware",26,22100,"Low (DSCR 1.72x)",11.2`,
      `"FMCG Wholesale & Groceries",20,17000,"Low (DSCR 1.90x)",10.5`,
      `"Logistics & Spare Parts",16,13600,"Moderate (DSCR 1.45x)",12.0`,
    ].join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TradeTrust_Sector_Exposure_${Date.now()}.csv`;
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
                RISK INTELLIGENCE
              </span>
              <span className="text-xs text-foreground-secondary font-mono">Portfolio Performance & Underwriting Funnel</span>
            </div>
            <h1 className="text-xl font-extrabold text-foreground mt-1">Lender Portfolio Analytics</h1>
            <p className="text-xs text-foreground-secondary">
              Real-time portfolio return, risk distribution, underwriting funnel conversion, and sector exposure.
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
              onClick={handleExportJSON}
              className="px-3.5 py-2 rounded-lg bg-violet hover:bg-violet-muted text-foreground text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-violet/10"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Report</span>
            </button>
          </div>
        </div>

        {/* Top KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-1">
            <span className="text-xs text-foreground-secondary uppercase tracking-wider font-mono">Total Capital Pool</span>
            <p className="text-2xl font-black font-mono text-foreground">${store.lenderProfile.totalCapitalAvailable.toLocaleString()}</p>
            <p className="text-[11px] text-mint font-mono">+14.2% YoY Allocation</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-1">
            <span className="text-xs text-foreground-secondary uppercase tracking-wider font-mono">Realized Net IRR</span>
            <p className="text-2xl font-black font-mono text-mint">10.9%</p>
            <p className="text-[11px] text-foreground-muted font-mono">Net of origination & gas fees</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-1">
            <span className="text-xs text-foreground-secondary uppercase tracking-wider font-mono">Blended Portfolio APR</span>
            <p className="text-2xl font-black font-mono text-foreground">11.4%</p>
            <p className="text-[11px] text-foreground-muted font-mono">Weighted by principal balance</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-1">
            <span className="text-xs text-foreground-secondary uppercase tracking-wider font-mono">Historical Default Rate</span>
            <p className="text-2xl font-black font-mono text-emerald-400">0.00%</p>
            <p className="text-[11px] text-emerald-400 font-mono">Zero write-offs across all vintages</p>
          </div>
        </div>

        {/* Section 1: Underwriting Conversion Funnel */}
        <div className="p-6 rounded-2xl bg-surface-card border border-theme space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-theme">
            <div>
              <h3 className="font-bold text-base text-foreground">Underwriting Funnel Conversion</h3>
              <p className="text-xs text-foreground-secondary">
                From public application to ZK proof verification, offer issuance, and onchain agreement execution.
              </p>
            </div>
            <span className="text-xs font-mono text-mint font-bold">Base Sepolia Pipeline</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-surface border border-theme space-y-2">
              <span className="text-[10px] text-foreground-secondary uppercase font-mono">1. Applications Received</span>
              <p className="text-2xl font-black font-mono text-foreground">142</p>
              <div className="w-full bg-surface-hover h-1.5 rounded-full overflow-hidden">
                <div className="bg-foreground-muted h-full w-full rounded-full" />
              </div>
              <p className="text-[10px] text-foreground-muted">100% Top of Funnel</p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-theme space-y-2">
              <span className="text-[10px] text-foreground-secondary uppercase font-mono">2. ZK Proofs Verified</span>
              <p className="text-2xl font-black font-mono text-mint">118</p>
              <div className="w-full bg-surface-hover h-1.5 rounded-full overflow-hidden">
                <div className="bg-mint h-full w-[83%]" />
              </div>
              <p className="text-[10px] text-mint">83.1% Proof Verification Rate</p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-theme space-y-2">
              <span className="text-[10px] text-foreground-secondary uppercase font-mono">3. Offers Dispatched</span>
              <p className="text-2xl font-black font-mono text-violet">94</p>
              <div className="w-full bg-surface-hover h-1.5 rounded-full overflow-hidden">
                <div className="bg-violet h-full w-[79%]" />
              </div>
              <p className="text-[10px] text-violet">79.7% Acceptance by Underwriters</p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-theme space-y-2">
              <span className="text-[10px] text-foreground-secondary uppercase font-mono">4. Executed & Disbursed</span>
              <p className="text-2xl font-black font-mono text-emerald-400">68</p>
              <div className="w-full bg-surface-hover h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-[72%]" />
              </div>
              <p className="text-[10px] text-emerald-400">72.3% Merchant Close Rate</p>
            </div>
          </div>
        </div>

        {/* Section 2: Sector Exposure & Risk Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sector Exposure Breakdown */}
          <div className="p-6 rounded-2xl bg-surface-card border border-theme space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-theme">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-violet" />
                <h3 className="font-bold text-sm text-foreground">Sector Portfolio Allocation</h3>
              </div>
              <span className="text-[10px] font-mono text-foreground-secondary">Max Single-Sector Limit: 40%</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground font-semibold">Apparel & Retail Distribution</span>
                  <span className="font-mono text-foreground font-bold">38% ($32,300)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface border border-theme overflow-hidden">
                  <div className="h-full bg-mint rounded-full" style={{ width: "38%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground font-semibold">Industrial Electronics & Hardware</span>
                  <span className="font-mono text-foreground font-bold">26% ($22,100)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface border border-theme overflow-hidden">
                  <div className="h-full bg-violet rounded-full" style={{ width: "26%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground font-semibold">FMCG Wholesale & Groceries</span>
                  <span className="font-mono text-foreground font-bold">20% ($17,000)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface border border-theme overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: "20%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground font-semibold">Logistics & Spare Parts</span>
                  <span className="font-mono text-foreground font-bold">16% ($13,600)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface border border-theme overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: "16%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Risk Profile / DSCR Distribution */}
          <div className="p-6 rounded-2xl bg-surface-card border border-theme space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-theme">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-mint" />
                <h3 className="font-bold text-sm text-foreground">Debt-Service-Coverage (DSCR) Health</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">0 Delinquent Accounts</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-surface border border-theme flex items-center justify-between text-xs">
                <div>
                  <span className="text-emerald-400 font-bold block">Prime Tier: DSCR ≥ 1.75x</span>
                  <p className="text-[11px] text-foreground-secondary mt-0.5">Exceptional monthly cash-flow buffer</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-foreground text-sm">78%</span>
                  <p className="text-[10px] text-foreground-muted font-mono">53 Borrowers</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-theme flex items-center justify-between text-xs">
                <div>
                  <span className="text-blue-400 font-bold block">Standard Tier: DSCR 1.25x – 1.74x</span>
                  <p className="text-[11px] text-foreground-secondary mt-0.5">Healthy debt servicing with standard buffer</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-foreground text-sm">22%</span>
                  <p className="text-[10px] text-foreground-muted font-mono">15 Borrowers</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-theme flex items-center justify-between text-xs">
                <div>
                  <span className="text-rose-400 font-bold block">Watchlist: DSCR &lt; 1.25x</span>
                  <p className="text-[11px] text-foreground-secondary mt-0.5">Requires dynamic restructuring or grace period</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-foreground text-sm">0%</span>
                  <p className="text-[10px] text-emerald-400 font-mono">None on Watchlist</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: AI Agentic Commerce Covenant Tracking */}
        <div className="p-6 rounded-2xl bg-surface-card border border-theme space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-theme">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-violet" />
              <h3 className="font-bold text-base text-foreground">Bitrefill Agentic Commerce Covenant Integrity</h3>
            </div>
            <span className="text-xs font-mono text-mint font-bold">100% Policy Adherence</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-surface border border-theme space-y-1">
              <span className="text-[10px] text-foreground-secondary uppercase font-mono">Capital Protected by Scoped AI Agent</span>
              <p className="text-xl font-bold font-mono text-foreground">84.2%</p>
              <p className="text-[11px] text-foreground-secondary">
                Disbursements restricted to authorized wholesale suppliers via Bitrefill agent whitelist.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-theme space-y-1">
              <span className="text-[10px] text-foreground-secondary uppercase font-mono">Misallocation or Fraud Rate</span>
              <p className="text-xl font-bold font-mono text-emerald-400">0.00%</p>
              <p className="text-[11px] text-foreground-secondary">
                Zero diversion of working-capital funds detected through onchain escrow controls.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-theme space-y-1">
              <span className="text-[10px] text-foreground-secondary uppercase font-mono">Wholesale Discount Capture</span>
              <p className="text-xl font-bold font-mono text-mint">3.8% Avg</p>
              <p className="text-[11px] text-foreground-secondary">
                Captured by AI commerce procurement engine comparing wholesale prices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
