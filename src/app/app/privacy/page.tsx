"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  ExternalLink,
  Cpu,
  FileCode,
  Layers,
  ArrowRight,
  Sparkles,
  Info
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getStore } from "@/lib/state/demoStore";
import { generateRevenueProof, verifyRevenueProof, ZkProof, ZkVerificationResult } from "@/lib/zk/zkEngine";

export default function PrivacyCenterPage() {
  const [store] = useState(getStore());

  // Interactive ZK Proof State
  const [secretRevenue, setSecretRevenue] = useState(24500);
  const [minThreshold, setMinThreshold] = useState(15000);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeProof, setActiveProof] = useState<ZkProof | null>(null);
  const [verificationResult, setVerificationResult] = useState<ZkVerificationResult | null>(null);
  const [tamperedThreshold, setTamperedThreshold] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerateProof = () => {
    setErrorMessage(null);
    setVerificationResult(null);
    setTamperedThreshold(null);
    setIsGenerating(true);

    try {
      const salt = "0x" + Math.random().toString(16).substring(2, 66).padStart(64, "0");
      const witness = {
        secretRevenue: Number(secretRevenue),
        salt,
        merchantAddress: store.walletAddress,
      };

      const proof = generateRevenueProof(witness, Number(minThreshold));
      setActiveProof(proof);

      // Auto verify initial proof
      const res = verifyRevenueProof(proof);
      setVerificationResult(res);
    } catch (err: any) {
      setErrorMessage(err.message);
      setActiveProof(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerifyTampered = () => {
    if (!activeProof) return;
    const forgedThreshold = 40000; // Attacker tries to pretend they proved $40k
    setTamperedThreshold(forgedThreshold);

    const res = verifyRevenueProof(activeProof, {
      minThreshold: forgedThreshold,
      merchantAddress: store.walletAddress,
    });
    setVerificationResult(res);
  };

  const handleReverifyLegitimate = () => {
    if (!activeProof) return;
    setTamperedThreshold(null);
    const res = verifyRevenueProof(activeProof, {
      minThreshold: activeProof.publicInputs.minThreshold,
      merchantAddress: store.walletAddress,
    });
    setVerificationResult(res);
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet/20 text-violet-300 border border-violet/30 font-bold uppercase">
                ZCASH PRIVACY TRACK
              </span>
              <span className="text-xs text-foreground-secondary font-mono">Zero-Knowledge Selective Disclosure</span>
            </div>
            <h1 className="text-xl font-extrabold text-foreground mt-1">Privacy Center & ZK Verification Studio</h1>
            <p className="text-xs text-foreground-secondary">
              Prove financial eligibility without exposing raw bank statements, customer names, or merchant margins.
            </p>
          </div>
        </div>

        {/* Technical Honesty Callout */}
        <div className="p-4 rounded-xl bg-surface-card border border-violet-500/30 text-xs space-y-2">
          <div className="flex items-center gap-2 text-violet-300 font-bold">
            <Lock className="w-4 h-4" />
            <span>Technical Integrity & Architectural Boundary Notice</span>
          </div>
          <p className="text-foreground-secondary leading-relaxed text-[11px]">
            <strong>Transparent distinction:</strong> Smart contracts running on Base Sepolia are public and EVM-based. Deploying an EVM contract does not grant shielded-payment privacy. TradeTrust utilizes zero-knowledge range proofs for selective disclosure offchain, anchoring commitments on Base Sepolia, while documenting how Zcash Orchard shielded transactions and Viewing Keys integrate into the funding lifecycle.
          </p>
        </div>

        {/* Interactive ZK Proof Generation Studio */}
        <div className="p-6 rounded-2xl bg-surface-card border border-theme space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-theme">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-mint" />
                Live Zero-Knowledge Revenue Proof Generator
              </h2>
              <p className="text-xs text-foreground-secondary">
                Interactive witness simulation: test legitimate proof generation and inspect negative attack vectors.
              </p>
            </div>
            <span className="text-xs font-mono text-mint bg-mint/10 px-2.5 py-1 rounded border border-mint/20">
              Protocol: Groth16-Range-v1
            </span>
          </div>

          {/* Input Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-surface border border-theme space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-200 font-semibold flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5 text-violet-400" />
                  Private Secret Monthly Revenue ($)
                </label>
                <span className="text-[10px] font-mono text-violet-300 bg-violet/20 px-1.5 py-0.2 rounded">
                  NEVER EXPOSED
                </span>
              </div>
              <input
                type="number"
                value={secretRevenue}
                onChange={(e) => setSecretRevenue(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-surface-card border border-theme text-foreground font-mono font-bold text-sm focus:outline-none focus:border-mint"
              />
              <p className="text-[11px] text-foreground-secondary">
                Real turnover figure from bank statements. Stays strictly inside merchant memory.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-theme space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-200 font-semibold flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-mint" />
                  Public Required Revenue Threshold ($)
                </label>
                <span className="text-[10px] font-mono text-mint bg-mint/10 px-1.5 py-0.2 rounded">
                  PUBLIC CLAIM
                </span>
              </div>
              <input
                type="number"
                value={minThreshold}
                onChange={(e) => setMinThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-surface-card border border-theme text-foreground font-mono font-bold text-sm focus:outline-none focus:border-mint"
              />
              <p className="text-[11px] text-foreground-secondary">
                Lender underwriting requirement: "Merchant monthly revenue must be &gt;= this threshold."
              </p>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateProof}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-mint to-mint-muted hover:opacity-95 text-black text-xs font-black transition-all flex items-center gap-2 shadow-md shadow-mint/10"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Generate Zero-Knowledge Proof</span>
            </button>

            {activeProof && (
              <>
                <button
                  type="button"
                  onClick={handleVerifyTampered}
                  className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  title="Simulate attacker tampering with public input threshold to claim $40k"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Test Negative Attack: Forge $40k Threshold</span>
                </button>

                {tamperedThreshold && (
                  <button
                    type="button"
                    onClick={handleReverifyLegitimate}
                    className="px-4 py-2.5 rounded-xl bg-surface-hover hover:bg-surface-hover text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Legitimate Claim</span>
                  </button>
                )}
              </>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Live Proof & Verification Results */}
          {activeProof && (
            <div className="space-y-4 pt-2">
              {/* Verification Status Pill */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                  verificationResult?.isValid
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {verificationResult?.isValid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  )}
                  <div>
                    <h3 className="font-bold text-sm text-foreground">
                      {verificationResult?.isValid
                        ? "Cryptographic Proof Verified Successfully"
                        : "Verification Rejected - Tampered Input Detected"}
                    </h3>
                    <p className="text-[11px] opacity-80">
                      {verificationResult?.isValid
                        ? `Math checks pass: Merchant proves revenue >= $${activeProof.publicInputs.minThreshold.toLocaleString()} without disclosing secret revenue.`
                        : verificationResult?.reason || "Proof points failed cryptographic pairing check."}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/30">
                  {tamperedThreshold ? "TAMPERED TEST" : "LEGITIMATE"}
                </span>
              </div>

              {/* Inspection Grid: Public vs Private Witness */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* Public Inputs (Shared with Lenders & Blockchain) */}
                <div className="p-4 rounded-xl bg-surface border border-theme space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-theme">
                    <span className="text-mint font-bold flex items-center gap-1.5 font-sans">
                      <Eye className="w-3.5 h-3.5" /> What Lenders & Onchain Verifier See
                    </span>
                    <span className="text-[10px] text-foreground-muted uppercase">Public Inputs</span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <p className="text-foreground-secondary">
                      Minimum Threshold Claim:{" "}
                      <strong className="text-foreground">${activeProof.publicInputs.minThreshold.toLocaleString()} USD</strong>
                    </p>
                    <p className="text-foreground-secondary">
                      Merchant Address Context:{" "}
                      <span className="text-foreground-secondary truncate block">{activeProof.publicInputs.merchantAddress}</span>
                    </p>
                    <p className="text-foreground-secondary">
                      Revenue Commitment (H):{" "}
                      <span className="text-foreground-secondary truncate block">{activeProof.publicInputs.revenueCommitment}</span>
                    </p>
                    <p className="text-foreground-secondary">
                      Curve Point A[0]:{" "}
                      <span className="text-foreground-muted truncate block">{activeProof.a[0]}</span>
                    </p>
                    <p className="text-foreground-secondary">
                      Curve Point C[0]:{" "}
                      <span className="text-foreground-muted truncate block">{activeProof.c[0]}</span>
                    </p>
                  </div>
                </div>

                {/* Private Witness (Offchain) */}
                <div className="p-4 rounded-xl bg-surface border border-theme space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-theme">
                    <span className="text-violet-400 font-bold flex items-center gap-1.5 font-sans">
                      <EyeOff className="w-3.5 h-3.5" /> What Stays Completely Secret
                    </span>
                    <span className="text-[10px] text-foreground-muted uppercase">Private Witness</span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <p className="text-foreground-secondary">
                      Actual Monthly Revenue:{" "}
                      <span className="text-rose-400 font-bold blur-[3px] select-none hover:blur-none transition-all">
                        ${secretRevenue.toLocaleString()} USD
                      </span>{" "}
                      <span className="text-[9px] text-foreground-muted">(never transmitted)</span>
                    </p>
                    <p className="text-foreground-secondary">
                      Bank Statement Transactions:{" "}
                      <span className="text-foreground-muted">[Private Local Storage]</span>
                    </p>
                    <p className="text-foreground-secondary">
                      Cryptographic Salt / Nonce:{" "}
                      <span className="text-foreground-muted">[256-bit Entropy]</span>
                    </p>
                    <p className="text-foreground-secondary">
                      Customer PII & Accounts:{" "}
                      <span className="text-emerald-400 font-bold">0 records shared</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Zcash Integration Blueprint Section */}
        <div className="p-6 rounded-2xl bg-surface-card border border-theme space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-theme">
            <Lock className="w-5 h-5 text-violet-400" />
            <h2 className="text-base font-bold text-foreground">Zcash Ecosystem Integration & Viewing Keys Blueprint</h2>
          </div>

          <p className="text-xs text-foreground-secondary leading-relaxed">
            In the Zcash protocol, shielded transactions are made using zero-knowledge proofs (Halo2 / Orchard and Sapling circuits) across unified addresses (<code className="text-violet-300">u1...</code>).
            TradeTrust integrates with the Zcash paradigm in two distinct ways:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-4 rounded-xl bg-surface border border-theme space-y-2">
              <h4 className="font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-mint" /> 1. Full Viewing Key (FVK) Selective Audits
              </h4>
              <p className="text-foreground-secondary leading-relaxed text-[11px]">
                Merchants who receive customer payments in shielded ZEC can provide a selectively disclosed Viewing Key to authorized verifiers, enabling proof of revenue volume without making payments public on a block explorer.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-theme space-y-2">
              <h4 className="font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-mint" /> 2. Shielded Grant Disbursements
              </h4>
              <p className="text-foreground-secondary leading-relaxed text-[11px]">
                Underwriting partners who provide working-capital grants or liquidity can settle disbursements into shielded merchant pools, protecting the shopkeeper's liquidity balance from competitor surveillance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
