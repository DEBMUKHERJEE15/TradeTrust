"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Wallet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Zap,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useWallet, WalletType } from "@/context/WalletContext";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectWalletModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { connectWallet, isConnecting, error, isConnected, address } = useWallet();
  const [selectedType, setSelectedType] = useState<WalletType | null>(null);
  const [hasInjected, setHasInjected] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasInjected(Boolean((window as any).ethereum));
    }
  }, []);

  // Keyboard escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectWallet = async (type: WalletType) => {
    setSelectedType(type);
    const success = await connectWallet(type);
    if (success) {
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  const walletOptions = [
    {
      id: "metamask" as WalletType,
      name: "MetaMask",
      description: "Connect using the MetaMask browser extension or mobile app",
      badge: "Popular",
      badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: (
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <span className="text-xl">🦊</span>
        </div>
      ),
      installed: hasInjected && (typeof window !== "undefined" && Boolean((window as any).ethereum?.isMetaMask)),
    },
    {
      id: "coinbase" as WalletType,
      name: "Coinbase Wallet",
      description: "Connect using Coinbase Smart Wallet or mobile app",
      badge: "Base Native",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      icon: (
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-white rounded-sm" />
          </div>
        </div>
      ),
      installed: hasInjected && (typeof window !== "undefined" && Boolean((window as any).ethereum?.isCoinbaseWallet)),
    },
    {
      id: "rainbow" as WalletType,
      name: "Rainbow / Rabby / Brave",
      description: "Connect using modern Web3 multichain wallets",
      badge: "EIP-1193",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      icon: (
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
          <span className="text-xl">🌈</span>
        </div>
      ),
      installed: hasInjected,
    },
    {
      id: "injected" as WalletType,
      name: "Browser Injected Wallet",
      description: hasInjected
        ? "Detected active Web3 wallet in this browser"
        : "Standard browser extension wallet",
      badge: hasInjected ? "Detected" : "Extension",
      badgeColor: hasInjected
        ? "bg-mint/10 text-mint border-mint/20"
        : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
      icon: (
        <div className="w-10 h-10 rounded-xl bg-mint/10 border border-mint/20 flex items-center justify-center shrink-0">
          <Wallet className="w-5 h-5 text-mint" />
        </div>
      ),
      installed: hasInjected,
    },
    {
      id: "demo" as WalletType,
      name: "Demo Sandbox Wallet",
      description: "1-Click instant simulated wallet with 1.85 ETH on Base Sepolia",
      badge: "Instant / No Extension",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      icon: (
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-emerald-400 fill-current" />
        </div>
      ),
      installed: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-surface-card border border-theme shadow-2xl p-6 overflow-hidden text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-theme mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-mint/10 border border-mint/20 flex items-center justify-center text-mint">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Connect Wallet</h2>
              <p className="text-xs text-foreground-secondary">
                Select your wallet to connect to Base Sepolia (Chain ID 84532)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification if any */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Connection Notice</p>
              <p className="text-[11px] mt-0.5 opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* List of Wallet Options */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {walletOptions.map((wallet) => {
            const isCurrentSelected = isConnecting && selectedType === wallet.id;

            return (
              <button
                key={wallet.id}
                onClick={() => handleSelectWallet(wallet.id)}
                disabled={isConnecting}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-surface border border-theme hover:border-mint hover:bg-surface-hover transition-all text-left group disabled:opacity-50 cursor-pointer"
              >
                <div className="flex items-center gap-3.5 pointer-events-none">
                  {wallet.icon}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground group-hover:text-mint transition-colors">
                        {wallet.name}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${wallet.badgeColor}`}>
                        {wallet.badge}
                      </span>
                    </div>
                    <p className="text-xs text-foreground-secondary mt-0.5">
                      {wallet.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pl-2 pointer-events-none">
                  {isCurrentSelected ? (
                    <Loader2 className="w-5 h-5 text-mint animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-foreground-secondary group-hover:text-mint group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Security & Disclaimer Footer */}
        <div className="mt-5 pt-4 border-t border-theme flex items-center justify-between text-[11px] text-foreground-secondary">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-mint" />
            <span>Secure Web3 EIP-1193 standard</span>
          </div>

          <span className="font-mono text-mint font-semibold">
            Base Sepolia • 84532
          </span>
        </div>
      </div>
    </div>
  );
}
