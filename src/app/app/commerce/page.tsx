"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  ShieldCheck,
  Lock,
  ExternalLink,
  Loader2,
  Clock,
  RotateCcw,
  Tag,
  DollarSign,
  Send,
  Sliders
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getStore, saveStore } from "@/lib/state/demoStore";
import {
  bitrefillAdapter,
  BitrefillProduct,
  PurchaseProposal,
  CommerceState,
  OrderExecutionResult,
} from "@/lib/commerce/bitrefillAdapter";

export default function AgenticCommercePage() {
  const [store, setStore] = useState(getStore());
  const [catalog, setCatalog] = useState<BitrefillProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [userPrompt, setUserPrompt] = useState("");

  // Agent State Machine
  const [agentState, setAgentState] = useState<CommerceState>("IDLE");
  const [activeProposal, setActiveProposal] = useState<PurchaseProposal | null>(null);
  const [executionResult, setExecutionResult] = useState<OrderExecutionResult | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [recipientInput, setRecipientInput] = useState("merchant@apexprovisions.com");
  const [quantityInput, setQuantityInput] = useState(1);

  useEffect(() => {
    loadCatalog();
  }, [selectedCategory, searchQuery]);

  const loadCatalog = async () => {
    const products = await bitrefillAdapter.discoverProducts({
      category: selectedCategory === "all" ? undefined : selectedCategory,
      query: searchQuery,
    });
    setCatalog(products);
  };

  const handleNaturalLanguageSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userPrompt.trim()) return;

    setAgentState("DISCOVERING");
    setStatusMessage("Agent interpreting goal and discovering compatible Bitrefill & wholesale products...");

    setTimeout(async () => {
      // Simple heuristic intent matching
      const p = userPrompt.toLowerCase();
      let matchedCategory = "all";
      let budget = 100;

      if (p.includes("packaging") || p.includes("wholesale") || p.includes("paper")) {
        matchedCategory = "wholesale_supplies";
      } else if (p.includes("airtime") || p.includes("data") || p.includes("sim") || p.includes("pos")) {
        matchedCategory = "mobile_airtime";
      } else if (p.includes("power") || p.includes("electric") || p.includes("utility")) {
        matchedCategory = "utilities";
      } else if (p.includes("amazon") || p.includes("walmart") || p.includes("voucher") || p.includes("gift")) {
        matchedCategory = "gift_cards";
      }

      // Extract budget number if present
      const budgetMatch = p.match(/\$?(\d+)/);
      if (budgetMatch) {
        budget = Number(budgetMatch[1]);
      }

      const products = await bitrefillAdapter.discoverProducts({
        category: matchedCategory === "all" ? undefined : matchedCategory,
        maxBudget: budget,
      });

      if (products.length > 0) {
        const topProduct = products[0];
        try {
          const spendingRemaining = store.spendingAuthorization.cumulativeLimit - store.spendingAuthorization.spentAmount;
          const proposal = bitrefillAdapter.prepareProposal({
            productId: topProduct.id,
            quantity: 1,
            recipientIdentifier: recipientInput,
            merchantAddress: store.walletAddress,
            spendingLimitRemaining: spendingRemaining,
            merchantBudget: budget,
          });

          setActiveProposal(proposal);
          setAgentState("PROPOSAL_READY");
          setStatusMessage(`Proposal ready: Found ${topProduct.name} within your $${budget} budget.`);
        } catch (err: any) {
          setAgentState("FAILED");
          setStatusMessage(`Proposal building failed: ${err.message}`);
        }
      } else {
        setAgentState("IDLE");
        setStatusMessage(`No products matched your exact query within budget $${budget}. Browse the catalog below.`);
      }
    }, 1000);
  };

  const handleSelectProduct = (product: BitrefillProduct) => {
    try {
      const spendingRemaining = store.spendingAuthorization.cumulativeLimit - store.spendingAuthorization.spentAmount;
      const proposal = bitrefillAdapter.prepareProposal({
        productId: product.id,
        quantity: quantityInput,
        recipientIdentifier: recipientInput,
        merchantAddress: store.walletAddress,
        spendingLimitRemaining: spendingRemaining,
        merchantBudget: 250,
      });

      setActiveProposal(proposal);
      setAgentState("PROPOSAL_READY");
      setStatusMessage(`Proposal prepared for ${product.name}. Awaiting explicit confirmation.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApprovePurchase = async () => {
    if (!activeProposal) return;

    setAgentState("EXECUTING");
    setStatusMessage("Executing verified purchase through provider adapter and recording onchain spend...");

    try {
      const result = await bitrefillAdapter.executeApprovedPurchase(activeProposal, true);

      // Decrement merchant remaining spending authorization
      const updatedSpent = store.spendingAuthorization.spentAmount + activeProposal.totalCost;
      const updatedStore = {
        ...store,
        spendingAuthorization: {
          ...store.spendingAuthorization,
          spentAmount: updatedSpent,
        },
      };

      saveStore(updatedStore);
      setStore(updatedStore);

      setExecutionResult(result);
      setAgentState("CONFIRMED");
      setStatusMessage("Purchase confirmed and delivered! Onchain spend recorded.");
    } catch (err: any) {
      setAgentState("FAILED");
      setStatusMessage(`Execution failed: ${err.message}`);
    }
  };

  const handleRejectPurchase = () => {
    setAgentState("CANCELLED");
    setStatusMessage("Proposal rejected by merchant. No funds deducted. Spend aborted.");
    setActiveProposal(null);
  };

  const remainingAllowance = store.spendingAuthorization.cumulativeLimit - store.spendingAuthorization.spentAmount;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                BITREFILL AGENTIC COMMERCE
              </span>
              <span className="text-xs text-foreground-secondary font-mono">Autonomous Purchasing with Human Approval Gate</span>
            </div>
            <h1 className="text-xl font-extrabold text-foreground mt-1">AI Agentic Commerce Terminal</h1>
            <p className="text-xs text-foreground-secondary">
              Procure store provisions, terminal data packs, and wholesale supplies within Base Sepolia spending limits.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-foreground-secondary uppercase">Provider Status</span>
            <p className="text-xs font-mono text-emerald-400 flex items-center justify-end gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Verified Bitrefill Sandbox
            </p>
          </div>
        </div>

        {/* Base Sepolia Programmable Spending Allowance Widget */}
        <div className="p-4 rounded-xl bg-surface-card border border-theme space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-mint" /> Base Sepolia Spending Authorization
            </span>
            <span className="text-[10px] font-mono text-mint px-2 py-0.5 rounded bg-mint/10 border border-mint/20">
              Contract Enforced
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-surface border border-theme">
              <span className="text-[10px] text-foreground-secondary uppercase">Cumulative Limit</span>
              <p className="font-mono font-bold text-foreground mt-0.5">
                ${store.spendingAuthorization.cumulativeLimit.toFixed(2)} USD
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-surface border border-theme">
              <span className="text-[10px] text-foreground-secondary uppercase">Spent Amount</span>
              <p className="font-mono font-bold text-foreground-secondary mt-0.5">
                ${store.spendingAuthorization.spentAmount.toFixed(2)} USD
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-surface border border-theme">
              <span className="text-[10px] text-foreground-secondary uppercase">Remaining Allowance</span>
              <p className="font-mono font-bold text-mint mt-0.5">${remainingAllowance.toFixed(2)} USD</p>
            </div>
            <div className="p-2.5 rounded-lg bg-surface border border-theme">
              <span className="text-[10px] text-foreground-secondary uppercase">Per-Tx Maximum</span>
              <p className="font-mono font-bold text-slate-200 mt-0.5">
                ${store.spendingAuthorization.perTransactionLimit.toFixed(2)} USD
              </p>
            </div>
          </div>
        </div>

        {/* State Machine Visualizer */}
        <div className="p-4 rounded-xl bg-surface border border-theme space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground-secondary font-mono text-[11px]">Finite State Machine:</span>
            <span className="font-mono text-xs font-bold text-foreground">Current State: [{agentState}]</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 text-[10px] font-mono text-center">
            <div
              className={`py-1.5 rounded transition-all ${
                agentState === "IDLE" ? "bg-slate-700 text-foreground font-bold" : "bg-surface-hover text-foreground-muted"
              }`}
            >
              IDLE
            </div>
            <div
              className={`py-1.5 rounded transition-all ${
                agentState === "DISCOVERING" ? "bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30" : "bg-surface-hover text-foreground-muted"
              }`}
            >
              DISCOVERING
            </div>
            <div
              className={`py-1.5 rounded transition-all ${
                agentState === "PROPOSAL_READY" ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30" : "bg-surface-hover text-foreground-muted"
              }`}
            >
              PROPOSAL_READY
            </div>
            <div
              className={`py-1.5 rounded transition-all ${
                agentState === "EXECUTING" ? "bg-violet/20 text-violet-300 font-bold border border-violet/30" : "bg-surface-hover text-foreground-muted"
              }`}
            >
              EXECUTING
            </div>
            <div
              className={`py-1.5 rounded transition-all ${
                agentState === "CONFIRMED"
                  ? "bg-mint/20 text-mint font-bold border border-mint/30"
                  : agentState === "CANCELLED"
                  ? "bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30"
                  : "bg-surface-hover text-foreground-muted"
              }`}
            >
              {agentState === "CANCELLED" ? "CANCELLED" : "CONFIRMED"}
            </div>
          </div>
          {statusMessage && <p className="text-[11px] text-foreground-secondary font-mono pt-1">{statusMessage}</p>}
        </div>

        {/* AI Intent Input */}
        <div className="p-5 rounded-2xl bg-surface-card border border-theme space-y-3 shadow-lg">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" /> Express a Purchasing Goal to the AI Agent
          </label>
          <form onSubmit={handleNaturalLanguageSearch} className="flex gap-2">
            <input
              type="text"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="e.g. I have a budget of $50. Find Walmart or Amazon gift cards for store cleaning supplies."
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-theme text-xs text-foreground focus:outline-none focus:border-mint"
            />
            <button
              type="submit"
              disabled={agentState === "DISCOVERING"}
              className="px-5 py-2.5 rounded-xl bg-mint hover:bg-mint-muted text-black text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-mint/10"
            >
              {agentState === "DISCOVERING" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Ask Agent</span>
            </button>
          </form>

          {/* Quick prompt shortcuts */}
          <div className="flex flex-wrap gap-1.5 text-[10px]">
            <span className="text-foreground-secondary">Quick tests:</span>
            <button
              type="button"
              onClick={() => setUserPrompt("Budget of $50 for Amazon office supplies")}
              className="px-2 py-0.5 rounded bg-surface-hover hover:bg-surface-hover text-foreground-secondary"
            >
              $50 Amazon
            </button>
            <button
              type="button"
              onClick={() => setUserPrompt("Need $15 airtime refill for Airtel shopkeeper POS")}
              className="px-2 py-0.5 rounded bg-surface-hover hover:bg-surface-hover text-foreground-secondary"
            >
              $15 POS Airtime
            </button>
            <button
              type="button"
              onClick={() => setUserPrompt("Need commercial electricity power voucher")}
              className="px-2 py-0.5 rounded bg-surface-hover hover:bg-surface-hover text-foreground-secondary"
            >
              Commercial Power
            </button>
            <button
              type="button"
              onClick={() => setUserPrompt("Need wholesale packaging supplies")}
              className="px-2 py-0.5 rounded bg-surface-hover hover:bg-surface-hover text-foreground-secondary"
            >
              Wholesale Boxes
            </button>
          </div>
        </div>

        {/* ACTIVE PURCHASE PROPOSAL REVIEW CARD (Awaiting explicit approval) */}
        {activeProposal && agentState === "PROPOSAL_READY" && (
          <div className="p-6 rounded-2xl bg-surface-card border-2 border-amber-500/40 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-theme">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="font-bold text-base text-foreground">Purchase Proposal Ready - Explicit Approval Required</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                PROPOSAL ID: {activeProposal.proposalId}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-surface border border-theme space-y-2">
                <p className="text-foreground-secondary">
                  Product Item: <strong className="text-foreground block font-sans text-sm">{activeProposal.product.name}</strong>
                </p>
                <p className="text-foreground-secondary">
                  Category: <span className="text-slate-200">{activeProposal.product.category}</span>
                </p>
                <p className="text-foreground-secondary">
                  Provider Source:{" "}
                  <span className="text-mint font-semibold">{activeProposal.product.provider}</span>
                </p>
                <p className="text-foreground-secondary">
                  Delivery Method: <span className="text-slate-200">{activeProposal.product.deliveryType}</span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-theme space-y-2">
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Item Price:</span>
                  <span className="text-foreground">${activeProposal.product.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Service Fee:</span>
                  <span className="text-foreground">${activeProposal.serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-theme">
                  <span className="text-foreground-secondary font-sans">Total Authorized Cost:</span>
                  <span className="text-mint">${activeProposal.totalCost.toFixed(2)} USD</span>
                </div>
                <div className="pt-1 text-[11px] text-foreground-secondary">
                  <span>Recipient Identifier: </span>
                  <span className="text-foreground">{activeProposal.recipientIdentifier}</span>
                </div>
              </div>
            </div>

            {/* Mandatory Human Decision Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-[11px] text-foreground-secondary">
                The agent will NOT execute this transaction until you explicitly click "Approve & Execute".
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleRejectPurchase}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
                >
                  Reject & Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApprovePurchase}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-mint to-mint-muted hover:opacity-95 text-black text-xs font-black transition-all shadow-lg shadow-mint/20"
                >
                  Approve & Execute (${activeProposal.totalCost.toFixed(2)})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ORDER CONFIRMATION RESULT */}
        {executionResult && agentState === "CONFIRMED" && (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4 shadow-xl animate-fade-in text-xs font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-foreground">Order Executed & Confirmed</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                {executionResult.isSimulated ? "SIMULATED RESULT" : "LIVE BITREFILL ORDER"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-foreground-secondary">Order Reference: <span className="text-foreground font-bold">{executionResult.orderId}</span></p>
                <p className="text-foreground-secondary">Purchased: <span className="text-foreground">{executionResult.purchasedProduct}</span></p>
                <p className="text-foreground-secondary">Recipient: <span className="text-foreground">{executionResult.recipient}</span></p>
                <p className="text-foreground-secondary">Total Settled: <span className="text-mint font-bold">${executionResult.totalPaid.toFixed(2)} {executionResult.currency}</span></p>
              </div>

              {executionResult.deliveryData && (
                <div className="p-3 rounded-lg bg-surface border border-theme space-y-1">
                  <p className="text-[10px] text-mint uppercase font-sans font-bold">Delivery Code & Tracking</p>
                  {executionResult.deliveryData.code && (
                    <p className="text-foreground font-bold text-sm tracking-wider">Voucher: {executionResult.deliveryData.code}</p>
                  )}
                  {executionResult.deliveryData.pin && (
                    <p className="text-foreground-secondary">PIN: {executionResult.deliveryData.pin}</p>
                  )}
                  {executionResult.deliveryData.referenceNumber && (
                    <p className="text-foreground-secondary truncate">Ref: {executionResult.deliveryData.referenceNumber}</p>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setAgentState("IDLE");
                  setActiveProposal(null);
                  setExecutionResult(null);
                }}
                className="px-4 py-2 rounded-lg bg-surface-hover hover:bg-surface-hover text-foreground text-xs font-semibold"
              >
                Perform Another Purchase
              </button>
            </div>
          </div>
        )}

        {/* Product Catalog Grid */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-foreground">Supported Provider Catalog</h3>
              <p className="text-xs text-foreground-secondary">
                Official Bitrefill products and separate wholesale inventory supplies.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 text-xs font-mono">
              {["all", "gift_cards", "mobile_airtime", "utilities", "wholesale_supplies"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                    selectedCategory === cat
                      ? "bg-mint text-black font-bold"
                      : "bg-[#0F182A] text-foreground-secondary hover:text-foreground border border-theme"
                  }`}
                >
                  {cat.replace("_", " ").toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {catalog.map((product) => {
              const isWholesale = product.provider === "WHOLESALE_SUPPLIER_SANDBOX";
              const isOverLimit = product.price > remainingAllowance;

              return (
                <div
                  key={product.id}
                  className="p-5 rounded-2xl bg-surface-card border border-theme hover:border-mint/30 transition-all flex flex-col justify-between space-y-4 shadow-md relative"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase border font-bold ${
                          isWholesale
                            ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                            : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        }`}
                      >
                        {isWholesale ? "Wholesale Supplier" : "Bitrefill Digital"}
                      </span>
                      <span className="text-xs font-mono font-bold text-foreground">${product.price.toFixed(2)}</span>
                    </div>

                    <h4 className="font-bold text-sm text-foreground leading-snug">{product.name}</h4>
                    <p className="text-xs text-foreground-secondary leading-relaxed line-clamp-2">{product.description}</p>
                  </div>

                  <div className="pt-2 border-t border-theme flex items-center justify-between">
                    <span className="text-[10px] font-mono text-foreground-muted">{product.deliveryType}</span>

                    <button
                      type="button"
                      disabled={isOverLimit}
                      onClick={() => handleSelectProduct(product)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isOverLimit
                          ? "bg-surface-hover text-foreground-muted cursor-not-allowed"
                          : "bg-mint hover:bg-mint-muted text-black"
                      }`}
                    >
                      {isOverLimit ? "Exceeds Limit" : "Select & Prepare"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
