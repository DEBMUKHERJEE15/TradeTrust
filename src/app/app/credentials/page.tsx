"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Layers,
  Lock,
  Calendar,
  Building2,
  Plus,
  RotateCcw,
  Download,
  AlertTriangle,
  FileText,
  BadgeCheck,
  Send,
  Loader2,
  X,
  Users,
  Clock,
  Sparkles
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getStore, saveStore, submitDispute } from "@/lib/state/demoStore";
import { BusinessCredential, SupplierProfile, DisputeRecord, SupplierAttestation } from "@/types";

export default function CredentialsRegistryPage() {
  const [store, setStore] = useState(getStore());
  const [activeTab, setActiveTab] = useState<"credentials" | "passport" | "suppliers" | "disputes">("credentials");

  // Dispute modal state
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeTargetType, setDisputeTargetType] = useState<"credential" | "offer" | "repayment">("credential");
  const [disputeTargetId, setDisputeTargetId] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setStore(getStore());
    window.addEventListener("tradetrust_store_updated", handleUpdate);
    return () => window.removeEventListener("tradetrust_store_updated", handleUpdate);
  }, []);

  const handleExportPassportJSON = () => {
    const passportData = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://tradetrust.financial/contexts/v1"
      ],
      type: ["VerifiablePresentation", "CashFlowPassport"],
      holder: {
        businessName: store.merchantProfile.businessName,
        businessType: store.merchantProfile.businessType,
        walletAddress: store.walletAddress,
        jurisdiction: `${store.merchantProfile.city}, ${store.merchantProfile.country}`,
      },
      issuanceDate: new Date().toISOString(),
      governingNetwork: "Base Sepolia (Chain ID 84532)",
      registryContract: "0x34A9922a0194E38dF2913a89047f001A9428F110",
      attestations: store.credentials.map((c) => ({
        id: c.id,
        type: c.credType,
        title: c.title,
        verifiedMetric: c.verifiedMetric,
        issuer: c.issuerName,
        commitmentHash: c.commitmentHash,
        onchainTxHash: c.onchainTxHash,
        expiresAt: new Date(c.expiresAt).toISOString(),
      })),
      supplierAttestations: (store.supplierAttestations || []).map((sa) => ({
        id: sa.id,
        supplierName: sa.supplierName,
        poNumber: sa.poNumber,
        invoiceAmount: sa.invoiceAmount,
        currency: sa.currency,
        deliveryStatus: sa.deliveryStatus,
        attestationHash: sa.attestationHash,
      })),
      cryptographicProof: {
        type: "JsonWebSignature2020",
        created: new Date().toISOString(),
        verificationMethod: `did:pkh:eip155:84532:${store.walletAddress}`,
        proofPurpose: "assertionMethod",
        jws: "eyJhbGciOiJSUzI1NiIsImNyaXQiOlsiYnN4Il19...9b84a1e948ff",
      },
    };

    const blob = new Blob([JSON.stringify(passportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TradeTrust_CashFlow_Passport_${store.merchantProfile.businessName.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason) return;
    setIsSubmittingDispute(true);

    try {
      await new Promise((r) => setTimeout(r, 700));

      const entityTypeMap: Record<string, "CREDENTIAL" | "REPAYMENT" | "APPLICATION" | "OFFER"> = {
        credential: "CREDENTIAL",
        offer: "OFFER",
        repayment: "REPAYMENT",
      };

      const targetRef = disputeTargetId || (store.credentials[0]?.id ?? "CRED-001");

      const newDispute = submitDispute({
        entityType: entityTypeMap[disputeTargetType] || "CREDENTIAL",
        entityId: targetRef,
        merchantAddress: store.walletAddress,
        title: `Correction Claim for ${targetRef}`,
        description: disputeReason,
      });

      setIsDisputeModalOpen(false);
      setDisputeReason("");
      alert(`Correction claim ${newDispute.id} registered! An independent auditor will review the cryptographically hashed records.`);
    } catch (err: any) {
      alert("Error submitting dispute: " + err.message);
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  const disputes = store.disputes || [];
  const suppliers = store.suppliers || [];
  const attestations = store.supplierAttestations || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-mint/10 text-mint border border-mint/20 font-bold uppercase">
                PORTABLE CREDENTIALS
              </span>
              <span className="text-xs text-foreground-secondary font-mono">Base Sepolia CredentialRegistry</span>
            </div>
            <h1 className="text-xl font-extrabold text-foreground mt-1">Cash-Flow Passport & Credentials Registry</h1>
            <p className="text-xs text-foreground-secondary">
              Cryptographically anchored business credentials, supplier attestations, and sovereign portable credentials.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPassportJSON}
              className="px-3.5 py-2 rounded-lg bg-surface border border-theme hover:bg-surface-hover text-foreground text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-mint" />
              <span>Export Passport JSON</span>
            </button>
            <Link
              href="/app/privacy"
              className="px-3.5 py-2 rounded-lg bg-mint hover:bg-mint-muted text-black text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate ZK Proof</span>
            </Link>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-theme pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("credentials")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "credentials"
                ? "bg-mint text-black font-bold shadow-sm"
                : "text-foreground-secondary hover:text-foreground hover:bg-surface"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Active Credentials ({store.credentials.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("passport")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "passport"
                ? "bg-mint text-black font-bold shadow-sm"
                : "text-foreground-secondary hover:text-foreground hover:bg-surface"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cash-Flow Passport Dossier</span>
          </button>
          <button
            onClick={() => setActiveTab("suppliers")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "suppliers"
                ? "bg-mint text-black font-bold shadow-sm"
                : "text-foreground-secondary hover:text-foreground hover:bg-surface"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Supplier Trust Network ({suppliers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("disputes")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "disputes"
                ? "bg-mint text-black font-bold shadow-sm"
                : "text-foreground-secondary hover:text-foreground hover:bg-surface"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Correction & Dispute Center ({disputes.length})</span>
          </button>
        </div>

        {/* TAB 1: CREDENTIALS GRID */}
        {activeTab === "credentials" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {store.credentials.map((cred) => {
              const expiresDate = new Date(cred.expiresAt).toLocaleDateString();

              return (
                <div
                  key={cred.id}
                  className="p-5 rounded-2xl bg-surface-card border border-theme hover:border-mint/30 transition-all space-y-4 shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-theme">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-mint/10 text-mint border border-mint/20 font-semibold">
                        {cred.credType.replace("_", " ")}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Valid & Active
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-foreground">{cred.title}</h3>
                      <p className="text-xs text-foreground-secondary mt-1 leading-relaxed">{cred.description}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-surface border border-theme space-y-1.5 text-xs font-mono">
                      <p className="text-foreground-secondary">
                        Verified Claim: <strong className="text-foreground block font-sans text-xs mt-0.5">{cred.verifiedMetric}</strong>
                      </p>
                      <p className="text-foreground-secondary">
                        Issuer: <span className="text-foreground-secondary">{cred.issuerName}</span>
                      </p>
                      <p className="text-foreground-secondary">
                        Commitment Hash:{" "}
                        <span className="text-mint truncate block">{cred.commitmentHash}</span>
                      </p>
                      <p className="text-foreground-secondary">
                        Expires: <span className="text-foreground-secondary">{expiresDate}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-theme flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-foreground-muted">Anchor: Base Sepolia</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setDisputeTargetType("credential");
                          setDisputeTargetId(cred.id);
                          setIsDisputeModalOpen(true);
                        }}
                        className="text-[11px] text-foreground-muted hover:text-foreground transition-colors"
                      >
                        File Correction
                      </button>
                      {cred.onchainTxHash && (
                        <a
                          href={`https://sepolia-explorer.base.org/tx/${cred.onchainTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-mint hover:underline font-mono text-[11px] flex items-center gap-1"
                        >
                          <span>BaseScan</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: CASH-FLOW PASSPORT DOSSIER */}
        {activeTab === "passport" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-surface-card border border-theme shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-theme">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-mint/10 text-mint border border-mint/20 font-bold uppercase">
                      SOVEREIGN IDENTITY
                    </span>
                    <span className="text-xs font-mono text-foreground-secondary">W3C Verifiable Presentation</span>
                  </div>
                  <h2 className="text-2xl font-black text-foreground mt-2">{store.merchantProfile.businessName}</h2>
                  <p className="text-xs text-foreground-secondary mt-1">
                    {store.merchantProfile.businessType} • Registered in {store.merchantProfile.city}, {store.merchantProfile.country}
                  </p>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <span className="text-[10px] uppercase font-mono text-foreground-secondary">Passport Rating</span>
                  <p className="text-3xl font-black font-mono text-mint">AA+</p>
                  <p className="text-[10px] text-emerald-400 font-mono">Top 5% Cash-Flow Stability</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-surface border border-theme space-y-1">
                  <span className="text-[10px] text-foreground-secondary uppercase">Issuer Protocol</span>
                  <p className="font-bold text-foreground">TradeTrust Credential Engine v2.1</p>
                  <p className="text-[10px] text-foreground-muted">Circom BN254 SNARKs</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface border border-theme space-y-1">
                  <span className="text-[10px] text-foreground-secondary uppercase">Decentralized Identifier</span>
                  <p className="font-bold text-mint truncate">did:pkh:eip155:84532:{store.walletAddress.slice(0, 8)}...</p>
                  <p className="text-[10px] text-foreground-muted">Base Sepolia Standard</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface border border-theme space-y-1">
                  <span className="text-[10px] text-foreground-secondary uppercase">Export Readiness</span>
                  <p className="font-bold text-emerald-400">Compliant with Lenders</p>
                  <p className="text-[10px] text-foreground-muted">Accepted across 12+ FinTechs</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface border border-theme space-y-3">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-mint" />
                  <span>Passport Cryptographic Verifications</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-background border border-theme">
                    <span className="text-foreground">Revenue Proof Commitment (≥ $15,000 / mo)</span>
                    <span className="font-mono text-mint font-bold text-[11px]">VALIDATED ONCHAIN</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-background border border-theme">
                    <span className="text-foreground">Continuous Trading Longevity (&gt; 3 Years)</span>
                    <span className="font-mono text-mint font-bold text-[11px]">VALIDATED ONCHAIN</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-background border border-theme">
                    <span className="text-foreground">Supplier Repayment Clean Track Record (99.4%)</span>
                    <span className="font-mono text-mint font-bold text-[11px]">VALIDATED ONCHAIN</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleExportPassportJSON}
                  className="px-5 py-2.5 rounded-xl bg-mint hover:bg-mint-muted text-black text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-mint/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Verifiable Passport Package (.JSON)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUPPLIER TRUST NETWORK */}
        {activeTab === "suppliers" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-card border border-theme flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <h3 className="font-bold text-foreground text-sm">Verified Supplier Trust Network</h3>
                <p className="text-foreground-secondary text-xs mt-0.5">
                  Suppliers providing wholesale credit line attestations and purchase order confirmations.
                </p>
              </div>
              <span className="text-xs font-mono text-mint px-2 py-0.5 rounded bg-mint/10 border border-mint/20 font-bold">
                {suppliers.length} Certified Partners
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suppliers.map((sup) => {
                const attestation = attestations.find((a) => a.supplierId === sup.id);

                return (
                  <div
                    key={sup.id}
                    className="p-5 rounded-2xl bg-surface-card border border-theme hover:border-mint/30 transition-all space-y-4 shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-theme">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-foreground">{sup.name}</h4>
                          {sup.verifiedStatus === "verified" && (
                            <BadgeCheck className="w-4 h-4 text-mint shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-foreground-secondary mt-0.5">
                          {sup.category} • {sup.city}, {sup.country}
                        </p>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-theme text-foreground-secondary">
                        {sup.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-2.5 rounded-lg bg-surface border border-theme">
                        <span className="text-[10px] text-foreground-secondary uppercase">Volume Delivered</span>
                        <p className="font-bold text-mint text-sm mt-0.5">${sup.totalVolumeDelivered.toLocaleString()}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-surface border border-theme">
                        <span className="text-[10px] text-foreground-secondary uppercase">Supplier Rating</span>
                        <p className="font-bold text-foreground text-sm mt-0.5">★ {sup.rating} / 5.0</p>
                      </div>
                    </div>

                    {attestation && (
                      <div className="p-3 rounded-xl bg-surface border border-theme space-y-1 text-xs">
                        <span className="text-[10px] font-mono text-foreground-secondary uppercase block">
                          Verified PO #{attestation.poNumber}:
                        </span>
                        <p className="text-foreground-secondary text-[11px] leading-relaxed">
                          {attestation.description}
                        </p>
                        <p className="text-[10px] font-mono text-mint pt-1">
                          Amount: ${attestation.invoiceAmount.toLocaleString()} {attestation.currency} • Status: {attestation.deliveryStatus.toUpperCase()}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: DISPUTE & CORRECTION CENTER */}
        {activeTab === "disputes" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-card border border-theme flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <h3 className="font-bold text-foreground text-sm">Correction & Dispute Registry</h3>
                <p className="text-foreground-secondary text-xs mt-0.5">
                  File formal correction requests if any credential claim, revenue calculation, or supplier record contains inaccuracies.
                </p>
              </div>
              <button
                onClick={() => setIsDisputeModalOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-violet hover:bg-violet-muted text-foreground text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-violet/10"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>File New Correction</span>
              </button>
            </div>

            {disputes.length === 0 ? (
              <div className="p-8 rounded-2xl bg-surface-card border border-theme text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-foreground text-sm">Zero Active Disputes</h4>
                <p className="text-xs text-foreground-secondary max-w-sm mx-auto">
                  All verifiable business credentials and supplier records are verified and undisputed.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {disputes.map((disp) => (
                  <div
                    key={disp.id}
                    className="p-4 rounded-xl bg-surface-card border border-theme space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-theme">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground">{disp.id}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-theme text-foreground-secondary uppercase">
                          {disp.entityType}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          disp.status === "resolved"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {disp.status.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-foreground font-semibold text-xs">{disp.title}</p>
                    <p className="text-foreground-secondary leading-relaxed text-[11px]">
                      {disp.description}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-foreground-muted">
                      <span>Target Ref: {disp.entityId}</span>
                      <span>Filed: {new Date(disp.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL: FILE DISPUTE / CORRECTION */}
        {isDisputeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md rounded-2xl bg-surface-card border border-theme shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-theme">
                <div>
                  <h3 className="font-bold text-base text-foreground">File Credential Correction</h3>
                  <p className="text-xs text-foreground-secondary">Request audit of verifiable evidence or terms</p>
                </div>
                <button
                  onClick={() => setIsDisputeModalOpen(false)}
                  className="p-1 rounded text-foreground-secondary hover:text-foreground hover:bg-surface"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFileDispute} className="space-y-4 text-xs">
                <div>
                  <label className="block text-foreground-secondary font-medium mb-1">Target Category</label>
                  <select
                    value={disputeTargetType}
                    onChange={(e: any) => setDisputeTargetType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground focus:outline-none focus:border-violet"
                  >
                    <option value="credential">Verifiable Business Credential</option>
                    <option value="offer">Lender Financing Offer</option>
                    <option value="repayment">Repayment Record</option>
                  </select>
                </div>

                <div>
                  <label className="block text-foreground-secondary font-medium mb-1">Target ID / Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. CRED-001 or OFF-2026-001"
                    value={disputeTargetId}
                    onChange={(e) => setDisputeTargetId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground font-mono focus:outline-none focus:border-violet"
                  />
                </div>

                <div>
                  <label className="block text-foreground-secondary font-medium mb-1">Correction Details & Evidence</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the discrepancy (e.g. updated monthly gross revenue statements, duplicate invoice hash, etc.)"
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground focus:outline-none focus:border-violet text-xs leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-theme">
                  <button
                    type="button"
                    onClick={() => setIsDisputeModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-surface hover:bg-surface-hover text-foreground-secondary font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingDispute}
                    className="px-5 py-2 rounded-lg bg-violet hover:bg-violet-muted text-foreground font-bold flex items-center gap-2 shadow-md shadow-violet/20"
                  >
                    {isSubmittingDispute ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Registering Claim...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Correction Claim</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
