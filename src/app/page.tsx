"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Lock,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Layers,
  Coins,
  FileCheck,
  EyeOff,
  Eye,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Store,
  Users,
  Play,
  Sparkles
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DemoTourModal } from "@/components/demo/DemoTourModal";
import { ProductDemoPlayer } from "@/components/media/ProductDemoPlayer";

export default function LandingPage() {
  const [isTourOpen, setIsTourOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden transition-colors duration-200">
      <Navbar onOpenDemoTour={() => setIsTourOpen(true)} />
      <DemoTourModal isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Ambient Radial Lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-mint/10 via-violet/10 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -top-12 right-0 w-[400px] h-[400px] bg-mint/5 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Live Testnet Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-card border border-theme text-xs text-foreground-secondary shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-mint animate-pulse" />
              <span className="font-mono text-mint font-bold">Base Sepolia Testnet</span>
              <span className="text-foreground-muted">•</span>
              <span className="text-foreground-secondary font-mono">Chain ID: 84532</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.08]">
              Capital for the businesses that{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-mint via-emerald-400 to-mint-muted">
                keep the world moving.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-foreground-secondary max-w-2xl mx-auto leading-relaxed">
              Turn verified business activity into financing opportunities. Keep sensitive financial information private.
              Let AI handle authorized purchases within strict spending limits.
            </p>

            {/* CTAs & Two Modes Selector */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
              <Link
                href="/app/apply"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-mint to-mint-muted text-black font-extrabold text-sm hover:opacity-95 transition-all shadow-mint-md flex items-center justify-center gap-2 group active:scale-98"
              >
                <span>Explore Your Financing</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <button
                onClick={() => setIsTourOpen(true)}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-surface hover:bg-surface-hover text-foreground border border-theme font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Zap className="w-4 h-4 text-mint fill-current" />
                <span>See How It Works (3-Min Tour)</span>
              </button>
            </div>

            {/* Dual Mode Direct Launch Cards */}
            <div className="pt-4 max-w-xl mx-auto space-y-2 text-center">
              <span className="text-[10px] font-mono uppercase tracking-wider text-foreground-muted font-bold block">
                Two Operational Modes — Choose Your Role:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <Link
                  href="/app"
                  className="p-4 rounded-2xl bg-surface-card hover:bg-surface border-2 border-mint/40 hover:border-mint transition-all space-y-1 shadow-lg group block"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-mint/10 text-mint border border-mint/20 font-bold uppercase">
                      FOR MERCHANTS
                    </span>
                    <ArrowRight className="w-4 h-4 text-mint group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="font-extrabold text-base text-foreground mt-1">Merchant Mode</h3>
                  <p className="text-xs text-foreground-secondary leading-normal">
                    Apply for financing, compare bids, generate ZK revenue proofs, and automate inventory purchases.
                  </p>
                </Link>

                <Link
                  href="/lender"
                  className="p-4 rounded-2xl bg-surface-card hover:bg-surface border-2 border-violet/40 hover:border-violet transition-all space-y-1 shadow-lg group block"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet/20 text-violet border border-violet/30 font-bold uppercase">
                      FOR LENDERS
                    </span>
                    <ArrowRight className="w-4 h-4 text-violet group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="font-extrabold text-base text-foreground mt-1">Lender Mode</h3>
                  <p className="text-xs text-foreground-secondary leading-normal">
                    Review merchant dossiers, inspect BN254 cryptographic proofs, issue competitive terms & track collections.
                  </p>
                </Link>
              </div>
            </div>

            {/* Trust Metrics Bar */}
            <div className="pt-10 grid grid-cols-3 gap-4 border-t border-theme max-w-lg mx-auto text-center font-mono">
              <div>
                <p className="text-2xl font-black text-foreground">100%</p>
                <p className="text-xs text-foreground-muted mt-0.5 font-sans">Private Witness</p>
              </div>
              <div>
                <p className="text-2xl font-black text-mint">84532</p>
                <p className="text-xs text-foreground-muted mt-0.5 font-sans">Base Sepolia</p>
              </div>
              <div>
                <p className="text-2xl font-black text-violet">&lt; 3 Min</p>
                <p className="text-xs text-foreground-muted mt-0.5 font-sans">Underwriting</p>
              </div>
            </div>
          </div>

          {/* Product Architecture Visualization */}
          <div className="mt-14 rounded-2xl bg-surface-card border border-theme shadow-2xl p-6 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-theme">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-foreground-secondary ml-2">
                  TradeTrust Unified Architecture • Verified Workflow
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-foreground-secondary">Context: <strong className="text-foreground">Apex Provisions & Fresh Market</strong></span>
                <span className="px-2 py-0.5 rounded bg-mint/10 text-mint border border-mint/20">ZK Proof Verified</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
              {/* Pillar 1 */}
              <div className="p-5 rounded-xl bg-surface border border-theme space-y-3 hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase">
                    Pillar 1: Base Sepolia
                  </span>
                </div>
                <h3 className="font-bold text-sm text-foreground">Onchain Financing Lifecycle</h3>
                <p className="text-xs text-foreground-secondary leading-relaxed">
                  Decentralized marketplace for capital requests, verifiable lender bids, and immutable repayment accounting.
                </p>
                <div className="pt-2 text-[11px] font-mono text-blue-400 flex items-center justify-between border-t border-theme">
                  <span>Contract State:</span>
                  <span className="text-foreground font-semibold">Active Agreements</span>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-5 rounded-xl bg-surface border border-theme space-y-3 hover:border-violet/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-violet/10 text-violet flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet/10 text-violet border border-violet/20 font-bold uppercase">
                    Pillar 2: Zcash Track
                  </span>
                </div>
                <h3 className="font-bold text-sm text-foreground">Selective Disclosure Proofs</h3>
                <p className="text-xs text-foreground-secondary leading-relaxed">
                  Merchants prove monthly turnover satisfies requirements without broadcasting banking statements or customer identities.
                </p>
                <div className="pt-2 text-[11px] font-mono text-violet flex items-center justify-between border-t border-theme">
                  <span>Witness Privacy:</span>
                  <span className="text-foreground font-semibold">Zero Leaks</span>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-5 rounded-xl bg-surface border border-theme space-y-3 hover:border-emerald-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                    Pillar 3: Bitrefill
                  </span>
                </div>
                <h3 className="font-bold text-sm text-foreground">Bounded Agentic Commerce</h3>
                <p className="text-xs text-foreground-secondary leading-relaxed">
                  Autonomous discovery of utility vouchers, inventory supplies, and airtime refills governed by strict human approval.
                </p>
                <div className="pt-2 text-[11px] font-mono text-emerald-400 flex items-center justify-between border-t border-theme">
                  <span>Safety Gate:</span>
                  <span className="text-foreground font-semibold">Explicit Confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM SECTION */}
      <section id="problem" className="py-20 border-t border-theme bg-surface/40 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-mono uppercase text-mint font-bold tracking-wider">The Working-Capital Dilemma</span>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight mt-1.5">
              Conventional financing is broken for small retailers.
            </h2>
            <p className="text-sm text-foreground-secondary mt-2.5 leading-relaxed">
              Local shopkeepers run essential businesses in every community. Yet when seasonal demand peaks or equipment fails, traditional credit fails them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-surface-card border border-theme space-y-3 hover:border-theme transition-all">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-foreground text-base">Excessive Paperwork</h3>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Traditional lenders demand months of notarized physical bank statements, tax audits, and collateral deeds that take weeks to compile and process.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-card border border-theme space-y-3 hover:border-theme transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <EyeOff className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-foreground text-base">Privacy Vulnerabilities</h3>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Applying requires broadcasting proprietary margin numbers, supplier invoices, and personal customer lists to dozens of third-party underwriters.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-card border border-theme space-y-3 hover:border-theme transition-all">
              <div className="w-10 h-10 rounded-xl bg-violet/10 border border-violet/20 flex items-center justify-center text-violet">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-foreground text-base">Predatory Opaque Terms</h3>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Merchant cash advances often hide effective APRs of 40% to 90% behind daily debit withholding and compounding factor rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION — WITH INTEGRATED PRODUCT DEMO VIDEO */}
      <section id="how-it-works" className="py-20 border-t border-theme scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Eyebrow & Headline */}
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono uppercase text-mint font-bold tracking-wider">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              From business verification to authorized commerce.
            </h2>
            <p className="text-sm text-foreground-secondary leading-relaxed">
              See how TradeTrust helps merchants present verifiable business evidence, explore financing offers, protect sensitive information, and prepare authorized purchases.
            </p>
          </div>

          {/* Embedded Product Demo Player & Synchronized 4-Stage Workflow */}
          <ProductDemoPlayer />

          <div className="text-center pt-4">
            <Link
              href="/app/apply"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-mint hover:bg-mint-muted text-black font-bold text-xs transition-transform shadow-mint-sm"
            >
              <span>Begin Your Financing Application</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* PRIVACY BY DESIGN (ZCASH TRACK) */}
      <section className="py-20 border-t border-theme bg-surface/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-mono uppercase text-violet font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-violet" />
                Zcash Privacy Track & Selective Disclosure
              </span>
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                Prove financial strength without sacrificing commercial secrecy.
              </h2>
              <p className="text-sm text-foreground-secondary leading-relaxed">
                Lenders don’t need to know every customer who bought goods at your grocery store.
                They only need mathematical certainty that your monthly turnover exceeds their underwriting threshold.
              </p>

              <div className="space-y-3.5 pt-1">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Private Witness Data Stays Offchain</h4>
                    <p className="text-xs text-foreground-secondary">Actual revenue ($24,500), customer balances, and raw invoices never touch the mempool.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Cryptographic Poseidon Commitment</h4>
                    <p className="text-xs text-foreground-secondary">Proof binds the eligibility claim to the merchant's address, preventing replay attacks.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Technically Honest Architecture</h4>
                    <p className="text-xs text-foreground-secondary">We clearly separate EVM onchain verification from Zcash shielded pools and viewing key disclosures.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/app/privacy"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface hover:bg-surface-hover text-violet border border-violet/30 text-xs font-bold transition-colors"
                >
                  <span>Explore ZK Privacy Studio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Comparison Visualizer */}
            <div className="p-6 rounded-2xl bg-surface-card border border-theme space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-theme">
                <h3 className="font-bold text-sm text-foreground">Disclosure Model Comparison</h3>
                <span className="text-[10px] font-mono text-foreground-muted uppercase">Underwriting Exposure</span>
              </div>

              <div className="space-y-4">
                {/* Traditional */}
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Traditional Lender Disclosure
                    </span>
                    <span className="text-[10px] font-mono text-rose-400">HIGH RISK</span>
                  </div>
                  <ul className="text-[11px] text-foreground-secondary space-y-1 list-disc pl-4">
                    <li>Discloses all customer names and transaction amounts</li>
                    <li>Exposes proprietary supplier margin structures</li>
                    <li>Files stored on vulnerable centralized loan servers</li>
                  </ul>
                </div>

                {/* TradeTrust ZK */}
                <div className="p-4 rounded-xl bg-mint/5 border border-mint/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-mint flex items-center gap-1.5">
                      <EyeOff className="w-3.5 h-3.5" /> TradeTrust Selective ZK Proof
                    </span>
                    <span className="text-[10px] font-mono text-mint">SECURE</span>
                  </div>
                  <ul className="text-[11px] text-foreground-secondary space-y-1 list-disc pl-4">
                    <li>Discloses only: <strong className="text-foreground">Revenue &gt;= $15,000 threshold</strong></li>
                    <li>Zero customer identities or bank numbers exposed</li>
                    <li>Verified instantly by smart contracts without manual inspection</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AGENTIC COMMERCE (BITREFILL TRACK) */}
      <section className="py-20 border-t border-theme">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual State Machine Card */}
            <div className="p-6 rounded-2xl bg-surface-card border border-theme space-y-5 order-2 lg:order-1">
              <div className="flex items-center justify-between pb-3 border-b border-theme">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono text-foreground">AI Agent State Machine</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Strict Human-in-the-Loop
                </span>
              </div>

              {/* State Machine Flow */}
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-surface border border-theme flex items-center justify-between">
                  <span className="text-foreground-secondary">1. IDLE &rarr; DISCOVERING</span>
                  <span className="text-foreground-muted">Queries Bitrefill Catalog</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-theme flex items-center justify-between">
                  <span className="text-foreground-secondary">2. PROPOSAL_READY</span>
                  <span className="text-foreground-muted">Calculates Fees & Limits</span>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-amber-300">
                  <span className="font-bold">3. AWAITING_APPROVAL</span>
                  <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded">MANDATORY USER CLICK</span>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-400">
                  <span className="font-bold">4. EXECUTING &rarr; CONFIRMED</span>
                  <span className="text-[10px]">Onchain Spend Recorded</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-theme text-[11px] text-foreground-secondary">
                <strong className="text-foreground">Security Guarantee:</strong> The agent has NO unrestricted private key access and CANNOT bypass the merchant-approved spending allowance on Base Sepolia.
              </div>
            </div>

            {/* Copy */}
            <div className="space-y-6 order-1 lg:order-2">
              <span className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                Bitrefill Agentic Commerce Track
              </span>
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                AI that works for your store, not against your balance.
              </h2>
              <p className="text-sm text-foreground-secondary leading-relaxed">
                Procure digital gift vouchers for bulk store provisions, recharge POS terminal data cards, or settle commercial utility bills through Bitrefill integrations.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                  <CheckCircle2 className="w-4 h-4 text-mint shrink-0" />
                  <span>Real catalog discovery matching requested budget and currency</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                  <CheckCircle2 className="w-4 h-4 text-mint shrink-0" />
                  <span>Programmable Base Sepolia spending authorization contracts</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                  <CheckCircle2 className="w-4 h-4 text-mint shrink-0" />
                  <span>Separate clearly labeled wholesale mock provider for inventory packaging</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/app/commerce"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-mint hover:bg-mint-muted text-black text-xs font-bold transition-transform shadow-mint-sm"
                >
                  <span>Launch Commerce Agent</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-20 border-t border-theme bg-surface/60">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint/10 text-mint border border-mint/20 text-xs font-mono">
            <span>Ready for Review</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Build your store’s financial foundation today.
          </h2>

          <p className="text-sm text-foreground-secondary max-w-xl mx-auto leading-relaxed">
            Experience verified merchant onboarding, zero-knowledge privacy proofs, and decentralized working-capital lending on Base Sepolia.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/app"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-mint hover:bg-mint-muted text-black font-bold text-sm transition-all shadow-mint-md"
            >
              Enter Merchant Dashboard
            </Link>
            <Link
              href="/lender"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-surface hover:bg-surface-hover text-foreground border border-theme font-semibold text-sm transition-all"
            >
              Enter Lender Portal
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
