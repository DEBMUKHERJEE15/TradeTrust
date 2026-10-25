"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Coins,
  ShieldCheck,
  Users,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Layers,
  Calendar,
  CheckCircle2,
  Clock
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getStore } from "@/lib/state/demoStore";

export default function LenderDashboard() {
  const [store, setStore] = useState(getStore());

  useEffect(() => {
    const handleUpdate = () => setStore(getStore());
    window.addEventListener("tradetrust_store_updated", handleUpdate);
    return () => window.removeEventListener("tradetrust_store_updated", handleUpdate);
  }, []);

  const pendingRequests = store.requests.filter(
    (r) => r.status === "under_review" || r.status === "offers_received"
  );
  const lenderOffers = store.offers.filter(
    (o) => o.lenderAddress.toLowerCase() === store.lenderProfile.address.toLowerCase()
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Lender Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#0C1322] to-[#121B30] border border-violet-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet/20 text-violet-300 border border-violet/30 font-bold uppercase">
                LENDER PORTAL (DEMO)
              </span>
              <span className="text-xs text-foreground-secondary font-mono">Base Sepolia #84532</span>
            </div>
            <h1 className="text-xl font-extrabold text-foreground mt-1">{store.lenderProfile.institution}</h1>
            <p className="text-xs text-foreground-secondary">
              Portfolio Lead: <strong>{store.lenderProfile.name}</strong> • Underwrite verified merchant requests with ZK eligibility proofs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/lender/requests"
              className="px-4 py-2 rounded-lg bg-violet hover:bg-violet-muted text-foreground text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>Review Merchant Requests ({pendingRequests.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Portfolio KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-2">
            <div className="flex items-center justify-between text-foreground-secondary text-xs">
              <span>Capital Available</span>
              <DollarSign className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-2xl font-black font-mono text-foreground">
              ${store.lenderProfile.totalCapitalAvailable.toLocaleString()}
            </p>
            <p className="text-xs text-foreground-secondary font-mono">Liquid working-capital fund</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-2">
            <div className="flex items-center justify-between text-foreground-secondary text-xs">
              <span>Active Deployments</span>
              <Coins className="w-4 h-4 text-mint" />
            </div>
            <p className="text-2xl font-black font-mono text-mint">
              ${store.lenderProfile.activeDeployments.toLocaleString()}
            </p>
            <p className="text-xs text-foreground-secondary font-mono">Across 8 verified merchants</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-2">
            <div className="flex items-center justify-between text-foreground-secondary text-xs">
              <span>Portfolio Avg APR</span>
              <Percent className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black font-mono text-foreground">11.4%</p>
            <p className="text-xs text-emerald-400 font-mono">0% 30-day delinquency</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-2">
            <div className="flex items-center justify-between text-foreground-secondary text-xs">
              <span>Active Extended Offers</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-black font-mono text-foreground">{lenderOffers.length}</p>
            <p className="text-xs text-foreground-secondary font-mono">Awaiting merchant signature</p>
          </div>
        </div>

        {/* Requests Awaiting Underwriting Table / List */}
        <div className="p-6 rounded-2xl bg-surface-card border border-theme space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-theme">
            <div>
              <h3 className="font-bold text-base text-foreground">Incoming Merchant Financing Requests</h3>
              <p className="text-xs text-foreground-secondary">
                Inspect ZK turnover proof commitments, risk parameters, and dispatch competitive funding terms.
              </p>
            </div>
            <Link
              href="/lender/requests"
              className="text-xs font-semibold text-violet-300 hover:underline flex items-center gap-1"
            >
              <span>View All Requests</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl bg-surface border border-theme hover:border-violet-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{req.businessName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-mint/10 text-mint border border-mint/20">
                      ZK Verified &gt;= ${req.evidenceSummary.verifiedThreshold.toLocaleString()}/mo
                    </span>
                  </div>
                  <p className="text-xs text-foreground-secondary">
                    {req.businessType} • {req.city}, {req.country} • Requested:{" "}
                    <strong className="text-foreground">${req.requestedAmount.toLocaleString()} USD</strong> ({req.durationMonths} Months, Max APR Cap {req.maxAcceptableApr}%)
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Link
                    href={`/lender/requests`}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-violet hover:bg-violet-muted text-foreground text-xs font-bold transition-all text-center"
                  >
                    Underwrite & Make Offer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function Percent(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" x2="5" y1="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}
