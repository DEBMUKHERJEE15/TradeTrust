"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Zap,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Coins,
  Lock,
  ShoppingBag,
  ExternalLink,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { getStore, resetDemoState, saveStore } from "@/lib/state/demoStore";

export interface DemoStep {
  step: number;
  title: string;
  pillar: string;
  badgeColor: string;
  description: string;
  technicalMechanism: string;
  route: string;
  role: "merchant" | "lender";
}

export const DEMO_STEPS: DemoStep[] = [
  {
    step: 1,
    title: "1. Merchant Profile & Verification Evidence",
    pillar: "Pillar 1: Base Sepolia",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    description: "Merchants onboard with turnover records. Bank statements are hashed offchain, and cryptographic commitments are stamped on Base Sepolia.",
    technicalMechanism: "Offchain CSV/POS sync hashes turnover evidence to Poseidon commitment C = Poseidon(Revenue, Salt, Address) stored in CredentialRegistry.sol.",
    route: "/app/apply",
    role: "merchant",
  },
  {
    step: 2,
    title: "2. Zero-Knowledge Revenue Range Proof",
    pillar: "Pillar 2: Zcash Privacy Track",
    badgeColor: "bg-violet/10 text-violet border-violet/30",
    description: "Generate a SNARK range proof proving turnover satisfies >= $15,000 threshold without revealing raw revenue numbers or customer lists.",
    technicalMechanism: "Groth16 prover computes range proof on BN254 curve offchain. Verifier checks curve points and public inputs on Base Sepolia or offchain verifier.",
    route: "/app/privacy",
    role: "merchant",
  },
  {
    step: 3,
    title: "3. Onchain Financing Request Submission",
    pillar: "Pillar 1: Base Sepolia",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    description: "Submit request with amount ($15,000), duration (12 months), APR cap (13.5%), and ZK proof commitment to TradeTrustMarketplace contract.",
    technicalMechanism: "Contract registers financing request, emits FinancingRequestCreated event, and opens request for competitive lender underwriting.",
    route: "/app",
    role: "merchant",
  },
  {
    step: 4,
    title: "4. Lender Underwriting & Term Bidding",
    pillar: "Pillar 1: Base Sepolia",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    description: "Lenders inspect verified ZK proof commitments and submit competing offers with transparent APRs and monthly repayment terms.",
    technicalMechanism: "Lender submits offer to TradeTrustMarketplace.sol with interest APR in basis points, monthly amortization, and escrow conditions.",
    route: "/lender/requests",
    role: "lender",
  },
  {
    step: 5,
    title: "5. Merchant Offer Comparison & Acceptance",
    pillar: "Pillar 1: Base Sepolia",
    badgeColor: "bg-mint/10 text-mint border-mint/30",
    description: "Merchant evaluates offers, chooses BlueHarbor (10.8% APR), and accepts. Smart contract activates lifecycle and rejects competing offers.",
    technicalMechanism: "Marketplace calls FinancingAgreementLifecycle.sol, activating agreement and deploying credit balance under merchant management.",
    route: "/app/offers",
    role: "merchant",
  },
  {
    step: 6,
    title: "6. Programmable Spending Policy Setup",
    pillar: "Pillar 3: Bitrefill Commerce",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    description: "Merchant authorizes AI Agent with $500 allowance and $150 per-tx maximum on SpendingAuthorization contract.",
    technicalMechanism: "SpendingAuthorization.sol records agent address, cumulative limit, expiration, and ensures no spend executes without human confirmation.",
    route: "/settings",
    role: "merchant",
  },
  {
    step: 7,
    title: "7. AI Agent Discovery & Merchant Approval",
    pillar: "Pillar 3: Bitrefill Commerce",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    description: "Merchant explicitly reviews proposal items, quantities, and totals. Once confirmed, the order executes with honest delivery code tracking.",
    technicalMechanism: "Server-side Bitrefill adapter confirms order via API or verified sandbox, recording transaction hash and decreasing allowance.",
    route: "/app/commerce",
    role: "merchant",
  },
];

export function DemoTourModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = DEMO_STEPS[currentStepIndex];

  const handleNavigateToStep = (step: DemoStep) => {
    const store = getStore();
    if (store.currentRole !== step.role) {
      saveStore({ ...store, currentRole: step.role });
    }
    router.push(step.route);
    onClose();
  };

  const handleReset = () => {
    resetDemoState();
    setCurrentStepIndex(0);
    router.push("/app");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-surface-card border border-theme shadow-2xl p-6 overflow-hidden text-foreground">
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-mint via-violet to-mint" />

        {/* Modal Top */}
        <div className="flex items-center justify-between pb-4 border-b border-theme">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-mint/10 border border-mint/20 flex items-center justify-center text-mint">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                Hackathon Judge Walkthrough
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-mint/10 text-mint border border-mint/20">
                  3-Minute Tour
                </span>
              </h3>
              <p className="text-xs text-foreground-secondary">
                Step-by-step end-to-end verification of Base Sepolia, Zcash Privacy, and Bitrefill Commerce.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Tracker */}
        <div className="py-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-foreground-secondary">
              Step {currentStepIndex + 1} of {DEMO_STEPS.length}
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${currentStep.badgeColor}`}>
              {currentStep.pillar}
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {DEMO_STEPS.map((step, idx) => (
              <button
                key={step.step}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? "bg-mint ring-2 ring-mint/30"
                    : idx < currentStepIndex
                    ? "bg-mint/40"
                    : "bg-surface border border-theme"
                }`}
                title={step.title}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-4 rounded-xl bg-surface border border-theme space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-foreground">{currentStep.title}</h4>
            <span className="text-[11px] px-2 py-0.5 rounded bg-surface-card text-foreground font-mono border border-theme">
              View: {currentStep.role === "merchant" ? "Merchant" : "Lender"}
            </span>
          </div>

          <p className="text-xs text-foreground-secondary leading-relaxed">{currentStep.description}</p>

          <div className="p-3 rounded-lg bg-surface-card border border-theme space-y-1">
            <p className="text-[11px] text-mint font-semibold uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3" /> Technical Mechanism:
            </p>
            <p className="text-[11px] font-mono text-foreground-secondary leading-normal">{currentStep.technicalMechanism}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo State</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {currentStepIndex > 0 && (
              <button
                onClick={() => setCurrentStepIndex((prev) => prev - 1)}
                className="px-3 py-2 rounded-lg bg-surface hover:bg-surface-hover text-foreground-secondary hover:text-foreground text-xs font-medium transition-colors border border-theme"
              >
                Previous
              </button>
            )}

            <button
              onClick={() => handleNavigateToStep(currentStep)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-mint hover:bg-mint-muted text-black text-xs font-bold transition-all shadow-lg shadow-mint/10"
            >
              <span>Jump to Live Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {currentStepIndex < DEMO_STEPS.length - 1 ? (
              <button
                onClick={() => setCurrentStepIndex((prev) => prev + 1)}
                className="px-3 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-theme text-foreground text-xs font-medium transition-colors flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-lg bg-violet hover:bg-violet-muted text-white text-xs font-medium transition-colors"
              >
                Finish Tour
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
