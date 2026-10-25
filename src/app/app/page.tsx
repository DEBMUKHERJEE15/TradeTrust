"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  DollarSign,
  Coins,
  ShieldCheck,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Bot,
  Send,
  Loader2,
  RotateCcw
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getStore, resetDemoState } from "@/lib/state/demoStore";
import { fundingAssistant } from "@/lib/ai/fundingAssistant";

export default function MerchantDashboard() {
  const [store, setStore] = useState(getStore());
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "assistant"; text: string }>>([
    {
      sender: "assistant",
      text: "Hello! I am your TradeTrust Funding Assistant. I can evaluate loan affordability, check your evidence completeness, or compare active lender offers. What would you like to know?",
    },
  ]);

  useEffect(() => {
    const handleUpdate = () => setStore(getStore());
    window.addEventListener("tradetrust_store_updated", handleUpdate);
    return () => window.removeEventListener("tradetrust_store_updated", handleUpdate);
  }, []);

  const activeRequest = store.requests.find((r) => r.status === "offers_received" || r.status === "under_review") || store.requests[0];
  const activeOffers = store.offers.filter((o) => o.status === "active");
  const activeAgreement = store.agreements.find((a) => a.status === "active");
  const activeCredentials = store.credentials.filter((c) => !c.isRevoked);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantInput.trim()) return;

    const userText = assistantInput;
    setAssistantInput("");
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setAssistantLoading(true);

    try {
      const res = await fundingAssistant.answerMerchantQuery(userText, {
        profile: store.merchantProfile,
        activeRequest,
        offers: activeOffers,
      });

      setChatMessages((prev) => [...prev, { sender: "assistant", text: res.response }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { sender: "assistant", text: "I encountered a minor processing delay. Please try again or rephrase your question." },
      ]);
    } finally {
      setAssistantLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Notification Banner */}
        <div className="p-4 rounded-xl bg-surface-card border border-theme flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-mint/10 text-mint border border-mint/20 font-bold uppercase">
                DEMO DATA
              </span>
              <span className="text-xs text-foreground-secondary font-mono">Base Sepolia #84532</span>
            </div>
            <h1 className="text-xl font-extrabold text-foreground mt-1">Merchant Financing Overview</h1>
            <p className="text-xs text-foreground-secondary">
              Welcome back, <strong className="text-foreground">{store.merchantProfile.businessName}</strong>. You have 2 lender offers awaiting your review.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/app/apply"
              className="px-4 py-2 rounded-lg bg-mint hover:bg-mint-muted text-black text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>New Financing Request</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Essential Questions Quick Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. What is happening with my request? */}
          <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-2">
            <div className="flex items-center justify-between text-foreground-secondary text-xs">
              <span>1. Request Status</span>
              <FileText className="w-4 h-4 text-mint" />
            </div>
            <p className="text-2xl font-black font-mono text-foreground">
              ${activeRequest ? activeRequest.requestedAmount.toLocaleString() : "0"}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-mint font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
              <span>Offers Received ({activeOffers.length})</span>
            </div>
          </div>

          {/* 2. What offers are available? */}
          <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-2">
            <div className="flex items-center justify-between text-foreground-secondary text-xs">
              <span>2. Available Offers</span>
              <Coins className="w-4 h-4 text-violet" />
            </div>
            <p className="text-2xl font-black font-mono text-foreground">
              {activeOffers.length} <span className="text-xs font-normal text-foreground-muted">offers</span>
            </p>
            <p className="text-xs text-foreground-secondary font-mono">
              Lowest APR: <strong className="text-mint">10.8%</strong>
            </p>
          </div>

          {/* 3. Verification & Credentials */}
          <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-2">
            <div className="flex items-center justify-between text-foreground-secondary text-xs">
              <span>3. Verified Credentials</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black font-mono text-foreground">
              {activeCredentials.length} <span className="text-xs font-normal text-foreground-muted">anchored</span>
            </p>
            <p className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> ZK Revenue Verified
            </p>
          </div>

          {/* 4. Upcoming Repayment Obligations */}
          <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-2">
            <div className="flex items-center justify-between text-foreground-secondary text-xs">
              <span>4. Next Obligation</span>
              <Calendar className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black font-mono text-foreground">
              ${activeAgreement ? activeAgreement.installmentAmount.toFixed(0) : "0"}
            </p>
            <p className="text-xs text-foreground-secondary font-mono">
              {activeAgreement ? "Due in 11 days (Inst. 10/12)" : "No active debt obligation"}
            </p>
          </div>
        </div>

        {/* Two-Column Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Active Request Details & Active Offers */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Request Card */}
            {activeRequest && (
              <div className="p-5 rounded-2xl bg-surface-card border border-theme space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-theme">
                  <div>
                    <span className="text-[10px] font-mono text-foreground-muted uppercase">Active Application</span>
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      {activeRequest.purpose}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {activeRequest.id}
                      </span>
                    </h2>
                  </div>
                  <Link
                    href={`https://sepolia-explorer.base.org/tx/${activeRequest.baseSepoliaTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono text-mint hover:underline flex items-center gap-1"
                  >
                    <span>View BaseScan Tx</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-surface border border-theme">
                    <span className="text-[10px] text-foreground-muted uppercase">Amount</span>
                    <p className="font-mono font-bold text-foreground text-sm mt-0.5">${activeRequest.requestedAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface border border-theme">
                    <span className="text-[10px] text-foreground-muted uppercase">Duration</span>
                    <p className="font-mono font-bold text-foreground text-sm mt-0.5">{activeRequest.durationMonths} Months</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface border border-theme">
                    <span className="text-[10px] text-foreground-muted uppercase">Max APR Cap</span>
                    <p className="font-mono font-bold text-foreground text-sm mt-0.5">{activeRequest.maxAcceptableApr}%</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface border border-theme">
                    <span className="text-[10px] text-foreground-muted uppercase">ZK Proof</span>
                    <p className="font-mono font-bold text-mint text-sm mt-0.5">&gt;= $15,000/mo</p>
                  </div>
                </div>

                <p className="text-xs text-foreground-secondary leading-relaxed">
                  <strong className="text-foreground">Intended Use of Funds:</strong> {activeRequest.intendedUse}
                </p>
              </div>
            )}

            {/* Received Offers Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">Received Lender Offers</h3>
                  <p className="text-xs text-foreground-secondary">Compare competing financing terms on Base Sepolia.</p>
                </div>
                <Link
                  href="/app/offers"
                  className="text-xs font-semibold text-mint hover:underline flex items-center gap-1"
                >
                  <span>View All Offers</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {activeOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="p-4 rounded-xl bg-surface-card border border-theme hover:border-mint/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{offer.lenderName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-mint/10 text-mint border border-mint/20">
                          {offer.interestAprBps / 100}% APR
                        </span>
                      </div>
                      <p className="text-xs text-foreground-secondary">
                        ${offer.amountOffered.toLocaleString()} USD • {offer.durationMonths} Months • Monthly Installment:{" "}
                        <strong className="text-foreground">${offer.monthlyPayment.toFixed(2)}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Link
                        href={`/app/offers/${offer.id}`}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg bg-mint hover:bg-mint-muted text-black text-xs font-bold transition-all text-center"
                      >
                        Review & Accept
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Existing Active Agreement Tracking */}
            {activeAgreement && (
              <div className="p-5 rounded-2xl bg-surface-card border border-theme space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-theme">
                  <div>
                    <span className="text-[10px] font-mono text-foreground-muted uppercase">Existing Working Capital Facility</span>
                    <h4 className="text-sm font-bold text-foreground">Cycle 1 - Apex Micro-Credit Agreement</h4>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Good Standing
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-foreground-secondary">
                    <span>Repayment Progress</span>
                    <span className="font-mono">
                      ${activeAgreement.totalRepaid.toLocaleString()} of ${activeAgreement.totalRepayable.toLocaleString()} ({Math.round((activeAgreement.totalRepaid / activeAgreement.totalRepayable) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface border border-theme overflow-hidden">
                    <div
                      className="h-full bg-mint rounded-full transition-all"
                      style={{ width: `${(activeAgreement.totalRepaid / activeAgreement.totalRepayable) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="p-2 rounded bg-surface border border-theme">
                    <span className="text-[10px] text-foreground-muted">Installments Paid</span>
                    <p className="font-mono font-bold text-foreground mt-0.5">
                      {activeAgreement.installmentsPaid} of {activeAgreement.installmentsTotal}
                    </p>
                  </div>
                  <div className="p-2 rounded bg-surface border border-theme">
                    <span className="text-[10px] text-foreground-muted">Next Due Date</span>
                    <p className="font-mono font-bold text-foreground mt-0.5">In 11 Days</p>
                  </div>
                  <div className="p-2 rounded bg-surface border border-theme">
                    <span className="text-[10px] text-foreground-muted">Next Payment</span>
                    <p className="font-mono font-bold text-mint mt-0.5">${activeAgreement.installmentAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Col: AI Funding Assistant Widget */}
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-surface-card border border-theme flex flex-col h-[520px]">
              <div className="flex items-center justify-between pb-3 border-b border-theme">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-mint/10 text-mint flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-foreground">AI Financing Assistant</h3>
                    <p className="text-[10px] text-foreground-muted">Affordability & Terms Advisor</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ONLINE
                </span>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-mint/10 text-mint border border-mint/20 ml-4 font-medium"
                        : "bg-surface text-foreground-secondary border border-theme mr-2"
                    }`}
                  >
                    <p className="whitespace-pre-line text-xs">{msg.text}</p>
                  </div>
                ))}
                {assistantLoading && (
                  <div className="p-3 rounded-xl bg-surface border border-theme flex items-center gap-2 text-xs text-foreground-secondary">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-mint" />
                    <span>Analyzing cash flow & underwriting criteria...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="py-2 flex flex-wrap gap-1.5 border-t border-theme">
                <button
                  type="button"
                  onClick={() => setAssistantInput("Can my store afford this $12,500 financing?")}
                  className="px-2 py-1 rounded bg-surface hover:bg-surface-hover border border-theme text-[10px] text-foreground-secondary transition-colors"
                >
                  Can I afford this?
                </button>
                <button
                  type="button"
                  onClick={() => setAssistantInput("Compare my 2 offers")}
                  className="px-2 py-1 rounded bg-surface hover:bg-surface-hover border border-theme text-[10px] text-foreground-secondary transition-colors"
                >
                  Compare offers
                </button>
                <button
                  type="button"
                  onClick={() => setAssistantInput("What documents am I missing?")}
                  className="px-2 py-1 rounded bg-surface hover:bg-surface-hover border border-theme text-[10px] text-foreground-secondary transition-colors"
                >
                  Missing documents?
                </button>
              </div>

              {/* Form Input */}
              <form onSubmit={handleSendMessage} className="pt-2 flex gap-2">
                <input
                  type="text"
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                  placeholder="Ask about affordability, APR, or terms..."
                  className="flex-1 px-3 py-2 rounded-lg bg-surface border border-theme text-xs text-foreground focus:outline-none focus:border-mint"
                />
                <button
                  type="submit"
                  disabled={assistantLoading || !assistantInput.trim()}
                  className="px-3 py-2 rounded-lg bg-mint hover:bg-mint-muted disabled:opacity-50 text-black font-bold text-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Quick Links Card */}
            <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-3">
              <span className="text-[10px] font-mono text-foreground-muted uppercase tracking-wider">Quick Actions</span>
              <div className="space-y-1.5">
                <Link
                  href="/app/privacy"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-surface text-xs text-foreground-secondary hover:text-foreground transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-violet" />
                    Generate ZK Privacy Proof
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-foreground-muted" />
                </Link>
                <Link
                  href="/app/commerce"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-surface text-xs text-foreground-secondary hover:text-foreground transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Bitrefill AI Purchasing Agent
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-foreground-muted" />
                </Link>
                <Link
                  href="/app/credentials"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-surface text-xs text-foreground-secondary hover:text-foreground transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-mint" />
                    View Business Credentials
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-foreground-muted" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
