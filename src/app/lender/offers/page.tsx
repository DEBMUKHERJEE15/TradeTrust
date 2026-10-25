"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Coins,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  XCircle
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getStore, saveStore } from "@/lib/state/demoStore";

export default function LenderOffersManagementPage() {
  const [store, setStore] = useState(getStore());

  useEffect(() => {
    const handleUpdate = () => setStore(getStore());
    window.addEventListener("tradetrust_store_updated", handleUpdate);
    return () => window.removeEventListener("tradetrust_store_updated", handleUpdate);
  }, []);

  const handleWithdrawOffer = (offerId: string) => {
    if (!confirm("Are you sure you want to withdraw this offer from the Base Sepolia marketplace?")) return;

    const updatedOffers = store.offers.map((o) => {
      if (o.id === offerId) return { ...o, status: "withdrawn" as any };
      return o;
    });

    const updatedStore = { ...store, offers: updatedOffers };
    saveStore(updatedStore);
    setStore(updatedStore);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet/20 text-violet-300 border border-violet/30 font-bold uppercase">
                OFFER PORTFOLIO
              </span>
              <span className="text-xs text-foreground-secondary font-mono">Base Sepolia Marketplace</span>
            </div>
            <h1 className="text-xl font-extrabold text-foreground mt-1">Lender Offer Portfolio Management</h1>
            <p className="text-xs text-foreground-secondary">
              Manage your active working-capital proposals, status updates, and acceptance confirmations.
            </p>
          </div>

          <Link
            href="/lender/requests"
            className="px-4 py-2 rounded-lg bg-violet hover:bg-violet-muted text-foreground text-xs font-bold transition-all"
          >
            Create New Offer
          </Link>
        </div>

        {/* Offers Grid */}
        <div className="space-y-4">
          {store.offers.map((offer) => {
            const isAccepted = offer.status === "accepted";
            const isRejected = offer.status === "rejected";
            const isWithdrawn = (offer.status as string) === "withdrawn";

            return (
              <div
                key={offer.id}
                className="p-6 rounded-2xl bg-surface-card border border-theme hover:border-violet-500/30 transition-all space-y-4 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-theme">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-foreground">{offer.id}</h3>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                          isAccepted
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                            : isRejected
                            ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                            : isWithdrawn
                            ? "bg-slate-700/50 text-foreground-secondary border-slate-600"
                            : "bg-mint/10 text-mint border-mint/20"
                        }`}
                      >
                        {offer.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-foreground-secondary">
                      Target Request: <span className="font-mono text-foreground-secondary">{offer.requestId}</span> • Created:{" "}
                      {new Date(offer.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-2xl font-black font-mono text-foreground">
                      ${offer.amountOffered.toLocaleString()} <span className="text-xs font-normal text-foreground-secondary">USD</span>
                    </p>
                    <p className="text-xs font-mono text-violet-300 font-semibold">
                      {offer.interestAprBps / 100}% Fixed APR
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-surface border border-theme">
                    <span className="text-[10px] text-foreground-secondary uppercase">Monthly Payment</span>
                    <p className="font-mono font-bold text-foreground text-sm mt-0.5">${offer.monthlyPayment.toFixed(2)}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface border border-theme">
                    <span className="text-[10px] text-foreground-secondary uppercase">Duration</span>
                    <p className="font-mono font-bold text-foreground text-sm mt-0.5">{offer.durationMonths} Months</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface border border-theme">
                    <span className="text-[10px] text-foreground-secondary uppercase">Total Repayable</span>
                    <p className="font-mono font-bold text-foreground text-sm mt-0.5">${offer.totalRepayable.toLocaleString()}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface border border-theme">
                    <span className="text-[10px] text-foreground-secondary uppercase">Origination Fee</span>
                    <p className="font-mono font-bold text-slate-200 text-sm mt-0.5">${offer.originationFee}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-3 text-[11px] font-mono text-foreground-secondary">
                    {offer.baseSepoliaTxHash ? (
                      <a
                        href={`https://sepolia-explorer.base.org/tx/${offer.baseSepoliaTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-mint hover:underline flex items-center gap-1"
                      >
                        <span>BaseScan Tx</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span>Onchain Broadcast Pending</span>
                    )}
                  </div>

                  {offer.status === "active" && (
                    <button
                      type="button"
                      onClick={() => handleWithdrawOffer(offer.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-colors"
                    >
                      Withdraw Offer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
