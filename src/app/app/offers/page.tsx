"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Coins,
  ArrowRight,
  TrendingUp,
  Percent,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Filter,
  DollarSign
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getStore } from "@/lib/state/demoStore";
import { LenderOffer } from "@/types";

export default function OffersMarketplacePage() {
  const [store, setStore] = useState(getStore());
  const [selectedSort, setSelectedSort] = useState<"apr" | "amount" | "duration">("apr");

  useEffect(() => {
    const handleUpdate = () => setStore(getStore());
    window.addEventListener("tradetrust_store_updated", handleUpdate);
    return () => window.removeEventListener("tradetrust_store_updated", handleUpdate);
  }, []);

  const offers = [...store.offers].sort((a, b) => {
    if (selectedSort === "apr") return a.interestAprBps - b.interestAprBps;
    if (selectedSort === "amount") return b.amountOffered - a.amountOffered;
    return a.durationMonths - b.durationMonths;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-mint/10 text-mint border border-mint/20 font-bold uppercase">
                DEMO DATA
              </span>
              <span className="text-xs text-foreground-secondary font-mono">Base Sepolia #84532</span>
            </div>
            <h1 className="text-xl font-extrabold text-foreground mt-1">Lender Offer Marketplace</h1>
            <p className="text-xs text-foreground-secondary">
              Decentralized working-capital offers received for your active financing requests.
            </p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-foreground-secondary flex items-center gap-1">
              <Filter className="w-3 h-3" /> Sort by:
            </span>
            <select
              value={selectedSort}
              onChange={(e: any) => setSelectedSort(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#0F182A] border border-theme text-slate-200 text-xs font-mono focus:outline-none focus:border-mint"
            >
              <option value="apr">Lowest APR</option>
              <option value="amount">Highest Capital</option>
              <option value="duration">Shortest Duration</option>
            </select>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="space-y-4">
          {offers.map((offer) => {
            const aprPercent = offer.interestAprBps / 100;
            const isLowestApr = offer.interestAprBps <= 1100;

            return (
              <div
                key={offer.id}
                className="p-6 rounded-2xl bg-surface-card border border-theme hover:border-mint/30 transition-all space-y-4 shadow-lg relative overflow-hidden"
              >
                {isLowestApr && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-mint text-black text-[10px] font-black uppercase rounded-bl-lg tracking-wider">
                    Lowest Rate
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-theme">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-foreground">{offer.lenderName}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {offer.id}
                      </span>
                    </div>
                    <p className="text-xs text-foreground-secondary">
                      Offer expires in 12 days • Onchain Offer Index: #{offer.onchainOfferId || 1}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-2xl font-black font-mono text-mint">
                      ${offer.amountOffered.toLocaleString()} <span className="text-xs font-normal text-foreground-secondary">USD</span>
                    </p>
                    <p className="text-xs font-mono text-foreground-secondary">
                      Fixed APR: <strong className="text-foreground">{aprPercent}%</strong>
                    </p>
                  </div>
                </div>

                {/* Key Term Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-surface border border-theme">
                    <span className="text-[10px] text-foreground-secondary uppercase">Monthly Payment</span>
                    <p className="font-mono font-bold text-foreground text-sm mt-0.5">${offer.monthlyPayment.toFixed(2)}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface border border-theme">
                    <span className="text-[10px] text-foreground-secondary uppercase">Repayment Term</span>
                    <p className="font-mono font-bold text-foreground text-sm mt-0.5">{offer.durationMonths} Months</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface border border-theme">
                    <span className="text-[10px] text-foreground-secondary uppercase">Total Repayable</span>
                    <p className="font-mono font-bold text-foreground text-sm mt-0.5">${offer.totalRepayable.toLocaleString()}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface border border-theme">
                    <span className="text-[10px] text-foreground-secondary uppercase">Origination Fee</span>
                    <p className="font-mono font-bold text-foreground text-sm mt-0.5">${offer.originationFee}</p>
                  </div>
                </div>

                <p className="text-xs text-foreground-secondary leading-relaxed">
                  <strong className="text-foreground">Terms Summary:</strong> {offer.termsSummary}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-[11px] text-foreground-secondary font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-mint" />
                    <span>Lender Identity Bound: {offer.lenderAddress.slice(0, 8)}...{offer.lenderAddress.slice(-4)}</span>
                  </div>

                  <Link
                    href={`/app/offers/${offer.id}`}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-mint hover:bg-mint-muted text-black text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-mint/10"
                  >
                    <span>View Amortization & Accept</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
