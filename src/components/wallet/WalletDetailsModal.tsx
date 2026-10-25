"use client";

import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  ExternalLink,
  LogOut,
  RefreshCw,
  Wallet,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { resetDemoState } from "@/lib/state/demoStore";

interface WalletDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenConnectModal: () => void;
}

export function WalletDetailsModal({
  isOpen,
  onClose,
  onOpenConnectModal,
}: WalletDetailsModalProps) {
  const {
    address,
    balance,
    chainId,
    isCorrectNetwork,
    walletType,
    disconnectWallet,
    switchNetwork,
    refreshBalance,
  } = useWallet();

  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen || !address) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalance();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleDisconnect = () => {
    disconnectWallet();
    onClose();
  };

  const handleSwitchWallet = () => {
    onClose();
    onOpenConnectModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-md rounded-2xl bg-surface-card border border-theme shadow-2xl p-6 overflow-hidden text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-theme mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-mint/10 border border-mint/20 flex items-center justify-center text-mint">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Connected Wallet</h2>
              <p className="text-xs text-foreground-secondary capitalize">
                {walletType || "Web3"} Provider
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

        {/* Network Warning if wrong network */}
        {!isCorrectNetwork && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Wrong Network (Chain #{chainId})</span>
            </div>
            <button
              onClick={switchNetwork}
              className="px-2.5 py-1 rounded bg-amber-500 text-black font-bold text-[11px] hover:bg-amber-400"
            >
              Switch to Base Sepolia
            </button>
          </div>
        )}

        {/* Account Details Box */}
        <div className="p-4 rounded-xl bg-surface border border-theme space-y-3 mb-4">
          {/* Address row */}
          <div>
            <div className="flex items-center justify-between text-xs text-foreground-secondary mb-1">
              <span>Account Address</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-mint hover:underline font-mono text-[11px]"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <p className="font-mono text-xs text-foreground break-all bg-surface-card p-2 rounded-lg border border-theme">
              {address}
            </p>
          </div>

          {/* Balance & Network row */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 rounded-lg bg-surface-card border border-theme">
              <div className="flex items-center justify-between text-[10px] text-foreground-secondary uppercase tracking-wider mb-0.5">
                <span>Balance</span>
                <button
                  onClick={handleRefresh}
                  className={`text-foreground-secondary hover:text-mint ${isRefreshing ? "animate-spin" : ""}`}
                  title="Refresh Balance"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <p className="text-sm font-bold font-mono text-foreground">{balance}</p>
            </div>

            <div className="p-2.5 rounded-lg bg-surface-card border border-theme">
              <span className="text-[10px] text-foreground-secondary uppercase tracking-wider block mb-0.5">
                Network
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-mint">
                <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
                <span>Base Sepolia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <a
            href={`https://sepolia.basescan.org/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-surface border border-theme hover:bg-surface-hover text-xs font-medium text-foreground transition-colors"
          >
            <span>View on BaseScan Explorer</span>
            <ExternalLink className="w-3.5 h-3.5 text-foreground-secondary" />
          </a>

          <button
            onClick={handleSwitchWallet}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-surface border border-theme hover:bg-surface-hover text-xs font-medium text-foreground transition-colors"
          >
            <span>Switch / Connect Another Wallet</span>
            <Wallet className="w-3.5 h-3.5 text-foreground-secondary" />
          </button>

          <button
            onClick={() => {
              resetDemoState();
              handleRefresh();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-surface border border-theme hover:bg-surface-hover text-xs font-medium text-foreground-secondary hover:text-foreground transition-colors"
          >
            <span>Reset Demo Store Data</span>
            <RotateCcw className="w-3.5 h-3.5 text-foreground-secondary" />
          </button>

          <button
            onClick={handleDisconnect}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-bold text-rose-400 transition-colors mt-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Disconnect Wallet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
