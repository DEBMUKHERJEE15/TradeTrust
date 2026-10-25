"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  Wallet,
  ShieldCheck,
  Key,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Layers,
  Lock,
  Save,
  Sliders,
  Sun,
  Moon,
  Laptop
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getStore, saveStore, resetDemoState } from "@/lib/state/demoStore";
import { useTheme } from "@/context/ThemeContext";
import { useWallet } from "@/context/WalletContext";
import { ConnectWalletModal } from "@/components/wallet/ConnectWalletModal";

export default function SettingsPage() {
  const [store, setStore] = useState(getStore());
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { address, isConnected, balance, disconnectWallet, walletType } = useWallet();
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  const [businessName, setBusinessName] = useState(store.merchantProfile.businessName);
  const [businessType, setBusinessType] = useState(store.merchantProfile.businessType);
  const [city, setCity] = useState(store.merchantProfile.city);
  const [monthlyRevenue, setMonthlyRevenue] = useState(store.merchantProfile.monthlyRevenueEstimate);
  const [cumulativeLimit, setCumulativeLimit] = useState(store.spendingAuthorization.cumulativeLimit);
  const [perTxLimit, setPerTxLimit] = useState(store.spendingAuthorization.perTransactionLimit);
  const [bitrefillApiKey, setBitrefillApiKey] = useState("");
  const [bitrefillApiSecret, setBitrefillApiSecret] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setStore(getStore());
    window.addEventListener("tradetrust_store_updated", handleUpdate);
    return () => window.removeEventListener("tradetrust_store_updated", handleUpdate);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedStore = {
      ...store,
      merchantProfile: {
        ...store.merchantProfile,
        businessName,
        businessType,
        city,
        monthlyRevenueEstimate: Number(monthlyRevenue),
      },
      spendingAuthorization: {
        ...store.spendingAuthorization,
        cumulativeLimit: Number(cumulativeLimit),
        perTransactionLimit: Number(perTxLimit),
      },
      bitrefillConfig: {
        hasCustomKeys: Boolean(bitrefillApiKey && bitrefillApiSecret),
        mode: (bitrefillApiKey && bitrefillApiSecret ? "live" : "sandbox") as "live" | "sandbox",
      },
    };

    saveStore(updatedStore);
    setStore(updatedStore);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const activeAddress = address || store.walletAddress;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-mint/10 text-mint border border-mint/20 font-bold uppercase">
              SETTINGS & CONSENTS
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-foreground mt-1">Platform Settings & Configurations</h1>
          <p className="text-xs text-foreground-secondary">
            Manage your connected Base Sepolia wallet, UI appearance themes, spending limits, API credentials, and privacy consents.
          </p>
        </div>

        {saveSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* Section 0: Theme & UI Appearance */}
        <div className="p-5 rounded-2xl bg-surface-card border border-theme space-y-4 shadow-xl text-xs">
          <div className="pb-3 border-b border-theme flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Moon className="w-4 h-4 text-mint" />
                UI Appearance & Theme
              </h3>
              <p className="text-foreground-secondary text-[11px] mt-0.5">
                Switch between professional black dark mode, crisp architectural light mode, or system auto.
              </p>
            </div>
            <span className="text-[10px] font-mono text-mint uppercase font-bold px-2 py-0.5 rounded bg-mint/10 border border-mint/20">
              Active: {resolvedTheme === "dark" ? "Black" : "Light"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                theme === "dark"
                  ? "bg-mint/10 border-mint text-foreground ring-1 ring-mint"
                  : "bg-surface border-theme text-foreground-secondary hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-black border border-zinc-800 flex items-center justify-center shrink-0">
                <Moon className="w-4 h-4 text-mint" />
              </div>
              <div className="text-left">
                <p className="font-bold text-xs text-foreground">Black Theme</p>
                <p className="text-[10px] text-foreground-secondary">OLED Jet Black</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                theme === "light"
                  ? "bg-amber-500/10 border-amber-500 text-foreground ring-1 ring-amber-500"
                  : "bg-surface border-theme text-foreground-secondary hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center shrink-0">
                <Sun className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-left">
                <p className="font-bold text-xs text-foreground">Light Theme</p>
                <p className="text-[10px] text-foreground-secondary">Clean Crisp White</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                theme === "system"
                  ? "bg-violet/10 border-violet text-foreground ring-1 ring-violet"
                  : "bg-surface border-theme text-foreground-secondary hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-surface border border-theme flex items-center justify-center shrink-0">
                <Laptop className="w-4 h-4 text-violet" />
              </div>
              <div className="text-left">
                <p className="font-bold text-xs text-foreground">System Mode</p>
                <p className="text-[10px] text-foreground-secondary">OS Preference</p>
              </div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Network & Wallet */}
          <div className="p-5 rounded-2xl bg-surface-card border border-theme space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-theme">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Wallet className="w-4 h-4 text-mint" />
                Base Sepolia Network & Wallet
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-mint bg-mint/10 px-2 py-0.5 rounded border border-mint/20 font-bold">
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
                <button
                  type="button"
                  onClick={() => setConnectModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-surface border border-theme text-foreground hover:bg-surface-hover font-semibold text-[11px]"
                >
                  {isConnected ? "Switch Wallet" : "Connect Any Wallet"}
                </button>
              </div>
            </div>

            <div className="space-y-3 font-mono">
              <div className="flex justify-between items-center">
                <span className="text-foreground-secondary">Target EVM Chain:</span>
                <span className="text-foreground font-bold">Base Sepolia (Chain ID: 84532)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground-secondary">RPC Endpoint:</span>
                <span className="text-foreground-secondary">https://sepolia.base.org</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground-secondary">Wallet Provider:</span>
                <span className="text-foreground font-bold capitalize">{walletType || "Injected / Demo"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground-secondary">Live Balance:</span>
                <span className="text-mint font-bold">{balance}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground-secondary">Connected Address:</span>
                {activeAddress ? (
                  <a
                    href={`https://sepolia.basescan.org/address/${activeAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mint hover:underline flex items-center gap-1"
                  >
                    <span className="truncate max-w-[200px]">{activeAddress}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-foreground-muted">Not Connected</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Merchant Business Profile */}
          <div className="p-5 rounded-2xl bg-surface-card border border-theme space-y-4 shadow-xl text-xs">
            <div className="pb-3 border-b border-theme">
              <h3 className="font-bold text-sm text-foreground">Merchant Business Profile</h3>
              <p className="text-foreground-secondary text-[11px]">Primary operational details used for underwriting profiles.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-foreground-secondary font-medium mb-1">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground focus:outline-none focus:border-mint"
                />
              </div>

              <div>
                <label className="block text-foreground-secondary font-medium mb-1">Business Classification</label>
                <input
                  type="text"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground focus:outline-none focus:border-mint"
                />
              </div>

              <div>
                <label className="block text-foreground-secondary font-medium mb-1">City / Location</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground focus:outline-none focus:border-mint"
                />
              </div>

              <div>
                <label className="block text-foreground-secondary font-medium mb-1">Average Monthly Revenue ($ USD)</label>
                <input
                  type="number"
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground font-mono focus:outline-none focus:border-mint"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Programmable Spending Authorization */}
          <div className="p-5 rounded-2xl bg-surface-card border border-theme space-y-4 shadow-xl text-xs">
            <div className="pb-3 border-b border-theme">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Sliders className="w-4 h-4 text-mint" />
                AI Agent Spending Limits (Base Sepolia)
              </h3>
              <p className="text-foreground-secondary text-[11px]">
                Enforce smart-contract caps preventing AI agents from exceeding authorized amounts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-foreground-secondary font-medium mb-1">Cumulative Spending Allowance ($ USD)</label>
                <input
                  type="number"
                  value={cumulativeLimit}
                  onChange={(e) => setCumulativeLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground font-mono focus:outline-none focus:border-mint"
                />
              </div>

              <div>
                <label className="block text-foreground-secondary font-medium mb-1">Per-Transaction Maximum ($ USD)</label>
                <input
                  type="number"
                  value={perTxLimit}
                  onChange={(e) => setPerTxLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground font-mono focus:outline-none focus:border-mint"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Bitrefill Live API Credentials */}
          <div className="p-5 rounded-2xl bg-surface-card border border-theme space-y-4 shadow-xl text-xs">
            <div className="pb-3 border-b border-theme">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                Bitrefill API Credentials (Optional)
              </h3>
              <p className="text-foreground-secondary text-[11px]">
                Leave blank to use verified Bitrefill sandbox test catalog.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-foreground-secondary font-medium mb-1">Bitrefill Client ID / Key</label>
                <input
                  type="password"
                  value={bitrefillApiKey}
                  onChange={(e) => setBitrefillApiKey(e.target.value)}
                  placeholder="Optional: bitrefill_api_key_..."
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground font-mono focus:outline-none focus:border-mint"
                />
              </div>

              <div>
                <label className="block text-foreground-secondary font-medium mb-1">Bitrefill API Secret</label>
                <input
                  type="password"
                  value={bitrefillApiSecret}
                  onChange={(e) => setBitrefillApiSecret(e.target.value)}
                  placeholder="Optional: bitrefill_api_secret_..."
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-foreground font-mono focus:outline-none focus:border-mint"
                />
              </div>
            </div>
          </div>

          {/* Submit & Reset Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => {
                if (confirm("Reset all TradeTrust demo data back to default?")) {
                  resetDemoState();
                  alert("Demo state reset!");
                }
              }}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Entire Demo State</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-mint hover:bg-mint-muted text-black text-xs font-bold transition-all shadow-md shadow-mint/10 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>

      <ConnectWalletModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
      />
    </AppLayout>
  );
}
