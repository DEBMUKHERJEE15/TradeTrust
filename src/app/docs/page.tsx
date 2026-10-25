"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Layers,
  Lock,
  ShoppingBag,
  ShieldCheck,
  ExternalLink,
  Code,
  Terminal,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CONTRACT_ADDRESSES } from "@/config/contracts";

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Header */}
        <div className="space-y-3 pb-8 border-b border-theme">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-mint/10 text-mint border border-mint/20 font-bold uppercase">
              TECHNICAL DOCUMENTATION
            </span>
            <span className="text-xs text-foreground-secondary font-mono">Architecture v1.0 • Base Sepolia</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            TradeTrust Technical Architecture
          </h1>
          <p className="text-sm text-foreground-secondary max-w-3xl leading-relaxed">
            A comprehensive developer guide to the smart contracts, zero-knowledge selective disclosure engine, and Bitrefill agentic commerce adapter powering TradeTrust.
          </p>
        </div>

        {/* 3 Pillars Technical Matrix */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Layers className="w-5 h-5 text-mint" /> 1. The Three Mandatory Technical Pillars
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-5 rounded-xl bg-surface-card border border-blue-500/30 space-y-3">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold uppercase">
                Pillar 1
              </span>
              <h3 className="font-bold text-foreground text-sm">Base Sepolia EVM Core</h3>
              <p className="text-foreground-secondary leading-relaxed text-[11px]">
                Autonomous financing marketplace, lender offer creation, borrower-exclusive acceptance, debt lifecycle accounting, and programmable spending authorization.
              </p>
              <div className="pt-2 text-[10px] font-mono text-foreground-secondary border-t border-theme">
                Chain ID: <strong>84532</strong>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-surface-card border border-violet-500/30 space-y-3">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet/10 text-violet-300 border border-violet/20 font-bold uppercase">
                Pillar 2
              </span>
              <h3 className="font-bold text-foreground text-sm">Zcash Privacy Track</h3>
              <p className="text-foreground-secondary leading-relaxed text-[11px]">
                Zero-knowledge selective disclosure range proofs (Groth16 BN254) proving monthly turnover &gt;= threshold without exposing raw statements. Documented Viewing Key integration.
              </p>
              <div className="pt-2 text-[10px] font-mono text-foreground-secondary border-t border-theme">
                Curve: <strong>BN254 / Alt-bn128</strong>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-surface-card border border-emerald-500/30 space-y-3">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold uppercase">
                Pillar 3
              </span>
              <h3 className="font-bold text-foreground text-sm">Bitrefill Agentic Commerce</h3>
              <p className="text-foreground-secondary leading-relaxed text-[11px]">
                Server-side adapter supporting live Bitrefill API and verified sandbox catalog. Enforces a strict 6-state machine with mandatory human approval before order dispatch.
              </p>
              <div className="pt-2 text-[10px] font-mono text-foreground-secondary border-t border-theme">
                Safety Gate: <strong>Human Confirmation</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Smart Contracts Reference */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Code className="w-5 h-5 text-mint" /> 2. Smart Contracts on Base Sepolia
          </h2>

          <div className="p-6 rounded-2xl bg-surface-card border border-theme space-y-4 text-xs font-mono">
            <div className="flex justify-between items-center pb-3 border-b border-theme">
              <span className="text-foreground font-bold font-sans text-sm">Contract Name</span>
              <span className="text-foreground-secondary font-sans text-xs">Base Sepolia Address</span>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-theme/50">
                <div>
                  <strong className="text-foreground font-sans">TradeTrustMarketplace.sol</strong>
                  <p className="text-[11px] text-foreground-secondary font-sans">Requests, lender offers, and borrower acceptance logic</p>
                </div>
                <a
                  href={`https://sepolia-explorer.base.org/address/${CONTRACT_ADDRESSES.TradeTrustMarketplace}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mint hover:underline flex items-center gap-1"
                >
                  <span>{CONTRACT_ADDRESSES.TradeTrustMarketplace}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-theme/50">
                <div>
                  <strong className="text-foreground font-sans">FinancingAgreementLifecycle.sol</strong>
                  <p className="text-[11px] text-foreground-secondary font-sans">Loan accounting, installment schedules, and token repayments</p>
                </div>
                <a
                  href={`https://sepolia-explorer.base.org/address/${CONTRACT_ADDRESSES.FinancingAgreementLifecycle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mint hover:underline flex items-center gap-1"
                >
                  <span>{CONTRACT_ADDRESSES.FinancingAgreementLifecycle}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-theme/50">
                <div>
                  <strong className="text-foreground font-sans">CredentialRegistry.sol</strong>
                  <p className="text-[11px] text-foreground-secondary font-sans">Commitment registry for ZK credentials without storing PII</p>
                </div>
                <a
                  href={`https://sepolia-explorer.base.org/address/${CONTRACT_ADDRESSES.CredentialRegistry}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mint hover:underline flex items-center gap-1"
                >
                  <span>{CONTRACT_ADDRESSES.CredentialRegistry}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-theme/50">
                <div>
                  <strong className="text-foreground font-sans">SpendingAuthorization.sol</strong>
                  <p className="text-[11px] text-foreground-secondary font-sans">Scoped allowance & per-tx boundaries for AI commerce agents</p>
                </div>
                <a
                  href={`https://sepolia-explorer.base.org/address/${CONTRACT_ADDRESSES.SpendingAuthorization}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mint hover:underline flex items-center gap-1"
                >
                  <span>{CONTRACT_ADDRESSES.SpendingAuthorization}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <strong className="text-foreground font-sans">ZKRevenueVerifier.sol</strong>
                  <p className="text-[11px] text-foreground-secondary font-sans">Onchain verifier checking Groth16 curve relations</p>
                </div>
                <a
                  href={`https://sepolia-explorer.base.org/address/${CONTRACT_ADDRESSES.ZKRevenueVerifier}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mint hover:underline flex items-center gap-1"
                >
                  <span>{CONTRACT_ADDRESSES.ZKRevenueVerifier}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Zcash Track Deep-Dive */}
        <section id="zcash" className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Lock className="w-5 h-5 text-violet-400" /> 3. Zcash Privacy Track: Technical Blueprint
          </h2>

          <div className="p-6 rounded-2xl bg-surface-card border border-theme space-y-4 text-xs">
            <p className="text-foreground-secondary leading-relaxed">
              TradeTrust addresses the privacy paradox of business lending: merchants need to demonstrate creditworthiness, but exposing raw bank turnover risks leaking trade secrets to competitors and predatory brokers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-surface border border-theme space-y-2">
                <span className="text-[10px] font-mono text-violet-300 uppercase font-bold">Mathematical Formulation</span>
                <p className="text-[11px] text-foreground-secondary leading-relaxed font-mono">
                  Let R be private secret revenue, S be 256-bit cryptographic salt, and T be public threshold.
                  <br /><br />
                  Witness Constraint: R - T &gt;= 0
                  <br />
                  Commitment: C = Poseidon(R, S, MerchantAddress)
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface border border-theme space-y-2">
                <span className="text-[10px] font-mono text-violet-300 uppercase font-bold">Zcash Viewing Keys Integration</span>
                <p className="text-[11px] text-foreground-secondary leading-relaxed">
                  In production deployments supporting shielded ZEC loans, the borrower provides a <em>Full Viewing Key (FVK)</em> to an automated compliance verifier, proving shielded incoming volume without publishing payment details on a public ledger.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bitrefill Agentic Commerce State Machine */}
        <section id="bitrefill" className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" /> 4. Bitrefill Commerce: State Machine & Safety Invariants
          </h2>

          <div className="p-6 rounded-2xl bg-surface-card border border-theme space-y-4 text-xs">
            <p className="text-foreground-secondary leading-relaxed">
              The AI agent operates under strict deterministic invariants to prevent unintended financial consequences:
            </p>

            <div className="p-4 rounded-xl bg-surface border border-theme space-y-2 font-mono text-[11px]">
              <p className="text-emerald-400 font-bold uppercase font-sans">Security Invariants:</p>
              <ul className="space-y-1 list-disc pl-4 text-foreground-secondary">
                <li><strong>Zero Private Key Exposure:</strong> The AI model never receives or touches raw private keys or seed phrases.</li>
                <li><strong>No Execution Without Explicit Confirmation:</strong> If proposal state != <code className="text-foreground">AWAITING_APPROVAL</code> or user click is missing, execution is mathematically aborted.</li>
                <li><strong>Bounded Allowance:</strong> Spending exceeds <code className="text-foreground">perTransactionLimit</code> or remaining allowance will revert onchain.</li>
                <li><strong>Replay Protection:</strong> Order hashes are recorded in contract storage and cannot be replayed.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Security Review Checklist */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-mint" /> 5. Security & Production-Readiness Roadmap
          </h2>

          <div className="p-6 rounded-2xl bg-surface-card border border-theme space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-surface border border-theme flex items-center gap-2 text-foreground-secondary">
                <CheckCircle2 className="w-4 h-4 text-mint shrink-0" />
                <span>Hardhat unit test suite passing (17 tests)</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-theme flex items-center gap-2 text-foreground-secondary">
                <CheckCircle2 className="w-4 h-4 text-mint shrink-0" />
                <span>ZK witness negative & replay tests passing</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-theme flex items-center gap-2 text-foreground-secondary">
                <CheckCircle2 className="w-4 h-4 text-mint shrink-0" />
                <span>SafeERC20 and non-reentrancy on token repayments</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-theme flex items-center gap-2 text-foreground-secondary">
                <CheckCircle2 className="w-4 h-4 text-mint shrink-0" />
                <span>Zero PII stored on Base Sepolia blockchain</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
