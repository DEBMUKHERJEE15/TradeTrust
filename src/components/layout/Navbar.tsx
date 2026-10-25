"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldCheck,
  Zap,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
  Wallet,
  Building2,
  Store,
  Sun,
  Moon
} from "lucide-react";
import { getStore, saveStore } from "@/lib/state/demoStore";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useTheme } from "@/context/ThemeContext";
import { useWallet } from "@/context/WalletContext";
import { ConnectWalletModal } from "@/components/wallet/ConnectWalletModal";
import { WalletDetailsModal } from "@/components/wallet/WalletDetailsModal";

export function Navbar({ onOpenDemoTour }: { onOpenDemoTour?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [store, setStore] = useState(getStore());
  const { isConnected, address, balance } = useWallet();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [walletDetailsOpen, setWalletDetailsOpen] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleUpdate = () => setStore(getStore());
    window.addEventListener("tradetrust_store_updated", handleUpdate);
    return () => window.removeEventListener("tradetrust_store_updated", handleUpdate);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Keyboard navigation: Escape key closes menus
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isLenderMode = pathname.startsWith("/lender");

  const handleSwitchMode = (mode: "merchant" | "lender") => {
    const updated = { ...store, currentRole: mode };
    saveStore(updated);
    setStore(updated);
  };

  const isAppRoute =
    pathname.startsWith("/app") ||
    pathname.startsWith("/lender") ||
    pathname === "/settings" ||
    pathname === "/docs";

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-[72px] border-b border-theme bg-background/95 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-mint rounded-lg p-1"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-mint via-emerald-400 to-mint-dark flex items-center justify-center text-black shadow-mint-sm group-hover:scale-105 transition-transform duration-200">
                <ShieldCheck className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-foreground group-hover:text-mint transition-colors">
                    TradeTrust
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Center: PRIMARY DUAL-MODE SWITCHER (Merchant <-> Lender) */}
          <div className="flex items-center p-1 rounded-xl bg-surface border border-theme shadow-sm">
            <Link
              href="/app"
              onClick={() => handleSwitchMode("merchant")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                !isLenderMode
                  ? "bg-mint text-black shadow-mint-sm"
                  : "text-foreground-secondary hover:text-foreground"
              }`}
              title="Switch to Merchant Mode (Financing & Cash-Flow Tools)"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Merchant Mode</span>
            </Link>
            <Link
              href="/lender"
              onClick={() => handleSwitchMode("lender")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isLenderMode
                  ? "bg-violet text-white shadow-sm"
                  : "text-foreground-secondary hover:text-foreground"
              }`}
              title="Switch to Lender Mode (Underwriting & Capital Deployment)"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Lender Mode</span>
            </Link>
          </div>

          {/* Right-Side Action Controls: Theme + Connect Wallet */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-4 text-xs font-medium text-foreground-secondary mr-1">
              <Link
                href="/app/privacy"
                className="hover:text-foreground dark:hover:text-mint transition-colors py-1"
              >
                ZK Privacy
              </Link>
              <Link
                href="/app/commerce"
                className="hover:text-foreground dark:hover:text-mint transition-colors py-1"
              >
                AI Commerce
              </Link>
              <Link
                href="/docs"
                className="hover:text-foreground dark:hover:text-mint transition-colors py-1"
              >
                Docs
              </Link>
            </nav>

            {/* EXPLICIT THEME TOGGLE: [ Dark | Light ] */}
            <ThemeToggle showLabel={true} />

            {/* CONNECT WALLET / ACCOUNT STATUS */}
            {isConnected && address ? (
              <button
                type="button"
                onClick={() => setWalletDetailsOpen(true)}
                aria-label="Connected Wallet Menu"
                title="View Connected Wallet & Network"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-theme text-xs font-mono text-foreground transition-all focus:outline-none focus:border-mint"
              >
                <div className="w-2 h-2 rounded-full bg-mint animate-pulse" />
                <span className="hidden sm:inline">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                <span className="sm:hidden font-mono">
                  {address.slice(0, 4)}..
                </span>
                <ChevronDown className="w-3 h-3 text-foreground-secondary" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConnectModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-mint hover:bg-mint-muted text-black font-extrabold text-xs transition-all shadow-mint-sm active:scale-98"
                title="Connect MetaMask, Coinbase, or Browser Wallet"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Connect Wallet</span>
              </button>
            )}

            {/* Mobile / Tablet Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-lg bg-surface border border-theme text-foreground-secondary hover:text-foreground lg:hidden transition-colors focus:outline-none focus:border-mint"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Responsive Mobile / Tablet Drawer */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="lg:hidden absolute top-[72px] left-0 w-full bg-background border-b border-theme shadow-2xl p-5 space-y-4 animate-slide-down z-50 backdrop-blur-xl max-h-[calc(100vh-72px)] overflow-y-auto"
          >
            {/* Mobile Mode Switcher */}
            <div className="space-y-1.5 p-3 rounded-xl bg-surface border border-theme">
              <span className="text-[10px] font-mono uppercase tracking-wider text-foreground-muted font-bold block">
                Select Operational Mode:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/app"
                  onClick={() => {
                    handleSwitchMode("merchant");
                    setMobileMenuOpen(false);
                  }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    !isLenderMode
                      ? "bg-mint text-black font-extrabold shadow-sm"
                      : "bg-surface-card text-foreground-secondary hover:text-foreground border border-theme"
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Merchant Mode</span>
                </Link>
                <Link
                  href="/lender"
                  onClick={() => {
                    handleSwitchMode("lender");
                    setMobileMenuOpen(false);
                  }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isLenderMode
                      ? "bg-violet text-white font-extrabold shadow-sm"
                      : "bg-surface-card text-foreground-secondary hover:text-foreground border border-theme"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Lender Mode</span>
                </Link>
              </div>
            </div>

            {/* Mobile Theme Selector */}
            <div className="space-y-1.5 p-3 rounded-xl bg-surface border border-theme">
              <span className="text-[10px] font-mono uppercase tracking-wider text-foreground-muted font-bold block">
                Theme Appearance:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    resolvedTheme === "dark"
                      ? "bg-black text-mint border border-mint/40 shadow-sm"
                      : "bg-surface-card text-foreground-secondary border border-theme"
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-mint" />
                  <span>Dark (True Black)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    resolvedTheme === "light"
                      ? "bg-white text-black border border-slate-300 shadow-sm"
                      : "bg-surface-card text-foreground-secondary border border-theme"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light Mode</span>
                </button>
              </div>
            </div>

            {/* Mobile Connect Wallet Action */}
            <div className="pt-1">
              {isConnected && address ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-theme">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-mint animate-pulse" />
                    <div>
                      <p className="text-[10px] uppercase font-mono text-foreground-secondary">Connected Account</p>
                      <p className="font-mono text-xs text-foreground font-bold">
                        {address.slice(0, 8)}...{address.slice(-6)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setWalletDetailsOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-surface-hover text-xs font-semibold text-foreground"
                  >
                    Manage
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setConnectModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-mint text-black font-extrabold text-xs shadow-mint-sm"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Any Web3 Wallet</span>
                </button>
              )}
            </div>

            {/* Mobile Navigation Links */}
            <nav className="flex flex-col space-y-1 pt-2">
              <Link
                href="/#problem"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-xs font-semibold text-foreground hover:bg-surface transition-colors"
              >
                The Problem
              </Link>
              <Link
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-xs font-semibold text-foreground hover:bg-surface transition-colors flex items-center justify-between"
              >
                <span>How It Works (Demo Video)</span>
              </Link>
              <Link
                href="/app/privacy"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-xs font-semibold text-foreground hover:bg-surface transition-colors flex items-center justify-between"
              >
                <span>ZK Privacy Track</span>
              </Link>
              <Link
                href="/app/commerce"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-xs font-semibold text-foreground hover:bg-surface transition-colors flex items-center justify-between"
              >
                <span>AI Commerce Agent</span>
              </Link>
              <Link
                href="/docs"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-xs font-semibold text-foreground hover:bg-surface transition-colors"
              >
                Documentation
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Connect Wallet Modal */}
      <ConnectWalletModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
      />

      {/* Wallet Details Popover Modal */}
      <WalletDetailsModal
        isOpen={walletDetailsOpen}
        onClose={() => setWalletDetailsOpen(false)}
        onOpenConnectModal={() => setConnectModalOpen(true)}
      />
    </>
  );
}
