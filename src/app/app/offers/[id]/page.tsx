"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Coins,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingUp,
  Percent,
  ExternalLink,
  Loader2,
  Lock,
  Layers,
  AlertTriangle
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getStore, saveStore } from "@/lib/state/demoStore";
import { FinancingAgreement } from "@/types";

export default function OfferDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [store, setStore] = useState(getStore());
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptConfirmed, setAcceptConfirmed] = useState(false);
  const [confirmedTx, setConfirmedTx] = useState("");

  const offerId = params.id as string;
  const offer = store.offers.find((o) => o.id === offerId) || store.offers[0];

  useEffect(() => {
    const handleUpdate = () => setStore(getStore());
    window.addEventListener("tradetrust_store_updated", handleUpdate);
    return () => window.removeEventListener("tradetrust_store_updated", handleUpdate);
  }, []);

  if (!offer) {
    return (
      <AppLayout>
        <div className="p-8 text-center space-y-4">
          <p className="text-sm text-foreground-secondary">Offer not found.</p>
          <Link href="/app/offers" className="text-xs text-mint underline">
            Return to Marketplace
          </Link>
        </div>
      </AppLayout>
    );
  }

  // Calculate Amortization Schedule
  const duration = offer.durationMonths;
  const principal = offer.amountOffered;
  const totalRepayable = offer.totalRepayable;
  const monthlyPayment = offer.monthlyPayment;
  const monthlyInterest = (totalRepayable - principal) / duration;
  const monthlyPrincipal = principal / duration;

  const schedule = Array.from({ length: duration }, (_, i) => {
    const monthNum = i + 1;
    const remaining = Math.max(0, totalRepayable - monthlyPayment * monthNum);
    return {
      month: monthNum,
      payment: monthlyPayment,
      principalPart: monthlyPrincipal,
      interestPart: monthlyInterest,
      remainingBalance: remaining,
    };
  });

  const handleAcceptOnchain = async () => {
    setIsAccepting(true);

    try {
      // Simulate real Base Sepolia tx signing & confirmation
      await new Promise((r) => setTimeout(r, 1200));

      const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setConfirmedTx(txHash);

      // Create new active financing agreement
      const newAgreement: FinancingAgreement = {
        id: `AGR-2026-${Math.floor(100 + Math.random() * 900)}`,
        offerId: offer.id,
        requestId: offer.requestId,
        merchantAddress: store.walletAddress,
        lenderAddress: offer.lenderAddress,
        merchantName: store.merchantProfile.businessName,
        lenderName: offer.lenderName,
        principalAmount: offer.amountOffered,
        interestAprBps: offer.interestAprBps,
        totalRepayable: offer.totalRepayable,
        totalRepaid: 0,
        durationMonths: offer.durationMonths,
        installmentAmount: offer.monthlyPayment,
        installmentsTotal: offer.durationMonths,
        installmentsPaid: 0,
        nextDueTimestamp: Date.now() + 30 * 24 * 3600 * 1000,
        status: "active",
        startDate: Date.now(),
        repayments: [],
        onchainAgreementId: store.agreements.length + 102,
        baseSepoliaTxHash: txHash,
      };

      // Update offer status to accepted, other offers to rejected, request to accepted
      const updatedOffers = store.offers.map((o) => {
        if (o.id === offer.id) return { ...o, status: "accepted" as const };
        if (o.requestId === offer.requestId) return { ...o, status: "rejected" as const };
        return o;
      });

      const updatedRequests = store.requests.map((r) => {
        if (r.id === offer.requestId) return { ...r, status: "accepted" as const };
        return r;
      });

      const updatedStore = {
        ...store,
        offers: updatedOffers,
        requests: updatedRequests,
        agreements: [newAgreement, ...store.agreements],
      };

      saveStore(updatedStore);
      setStore(updatedStore);
      setAcceptConfirmed(true);
    } catch (err: any) {
      alert("Acceptance error: " + err.message);
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/app/offers"
            className="flex items-center gap-1.5 text-xs text-foreground-secondary hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Offers</span>
          </Link>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-mint/10 text-mint border border-mint/20">
            Base Sepolia #84532
          </span>
        </div>

        {/* Offer Summary Card */}
        <div className="p-6 rounded-2xl bg-surface-card border border-theme space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-theme">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{offer.lenderName}</h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  {offer.id}
                </span>
              </div>
              <p className="text-xs text-foreground-secondary mt-0.5">
                Onchain Lender Address: <span className="font-mono text-foreground-secondary">{offer.lenderAddress}</span>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-3xl font-black font-mono text-mint">
                ${offer.amountOffered.toLocaleString()}{" "}
                <span className="text-xs font-normal text-foreground-secondary">USD</span>
              </p>
              <p className="text-xs text-foreground-secondary font-mono">
                {offer.interestAprBps / 100}% Annualized APR
              </p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-surface border border-theme">
              <span className="text-[10px] text-foreground-secondary uppercase">Monthly Installment</span>
              <p className="font-mono font-bold text-foreground text-base mt-0.5">${offer.monthlyPayment.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-theme">
              <span className="text-[10px] text-foreground-secondary uppercase">Total Interest</span>
              <p className="font-mono font-bold text-slate-200 text-base mt-0.5">
                ${(offer.totalRepayable - offer.amountOffered).toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-theme">
              <span className="text-[10px] text-foreground-secondary uppercase">Total Repayable</span>
              <p className="font-mono font-bold text-foreground text-base mt-0.5">${offer.totalRepayable.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-theme">
              <span className="text-[10px] text-foreground-secondary uppercase">Origination Fee</span>
              <p className="font-mono font-bold text-slate-200 text-base mt-0.5">${offer.originationFee}</p>
            </div>
          </div>

          {/* Affordability Safe Buffer Indicator */}
          <div className="p-3.5 rounded-xl bg-mint/5 border border-mint/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-mint shrink-0" />
              <span className="text-foreground-secondary">
                <strong>Strong Cash Flow Buffer:</strong> Monthly payment (${offer.monthlyPayment.toFixed(0)}) represents only{" "}
                <strong className="text-foreground">13.9%</strong> of your net monthly free cash flow ($8,300/mo).
              </span>
            </div>
            <span className="text-[10px] font-mono text-mint px-2 py-0.5 rounded bg-mint/10 border border-mint/20">
              DSCR 7.2x
            </span>
          </div>

          {/* Acceptance Action / Confirmation Card */}
          {acceptConfirmed ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 animate-fade-in">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-foreground">Offer Accepted & Agreement Created on Base Sepolia!</h3>
              <p className="text-xs text-foreground-secondary max-w-md mx-auto">
                Transaction confirmed. The financing agreement is now active and tracked in your lifecycle schedule.
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <a
                  href={`https://sepolia-explorer.base.org/tx/${confirmedTx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-mint hover:underline flex items-center gap-1"
                >
                  <span>View on BaseScan</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <Link
                  href="/app"
                  className="px-4 py-1.5 rounded-lg bg-mint hover:bg-mint-muted text-black text-xs font-bold"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-xs text-foreground-secondary">
                By accepting, you sign the financing agreement on Base Sepolia and reject all competing offers.
              </p>

              <button
                type="button"
                disabled={isAccepting || offer.status !== "active"}
                onClick={handleAcceptOnchain}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-mint to-mint-muted text-black text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-mint/20 hover:opacity-95 disabled:opacity-50"
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing on Base Sepolia...</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4" />
                    <span>Accept Offer on Base Sepolia</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Amortization Schedule Table */}
        <div className="p-6 rounded-2xl bg-surface-card border border-theme space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-theme">
            <div>
              <h3 className="font-bold text-sm text-foreground">Full Repayment Amortization Schedule</h3>
              <p className="text-xs text-foreground-secondary">Monthly breakdown of principal, interest, and remaining debt balance.</p>
            </div>
            <span className="text-xs font-mono text-foreground-secondary">{duration} Installments</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-theme text-foreground-secondary">
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Principal Part</th>
                  <th className="py-2.5 px-3">Interest Part</th>
                  <th className="py-2.5 px-3 text-right">Remaining Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A263D]/50 text-slate-200">
                {schedule.map((row) => (
                  <tr key={row.month} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-2 px-3 font-bold text-foreground-secondary">Month {row.month}</td>
                    <td className="py-2 px-3 text-mint font-semibold">${row.payment.toFixed(2)}</td>
                    <td className="py-2 px-3 text-foreground-secondary">${row.principalPart.toFixed(2)}</td>
                    <td className="py-2 px-3 text-foreground-secondary">${row.interestPart.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-bold text-foreground">
                      ${row.remainingBalance.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
