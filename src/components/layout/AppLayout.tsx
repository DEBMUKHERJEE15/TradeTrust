"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FilePlus,
  Coins,
  ShieldCheck,
  ShoppingBag,
  History,
  Award,
  Settings,
  BookOpen,
  Users,
  RotateCcw,
  Menu,
  X,
  Lock,
  Wallet,
  CreditCard,
  LineChart,
  FileCheck,
  BarChart3,
  Calendar,
  Store,
  Building2,
  Sun,
  Moon
} from "lucide-react";
import { Navbar } from "./Navbar";
import { DemoTourModal } from "@/components/demo/DemoTourModal";
import { ConnectWalletModal } from "@/components/wallet/ConnectWalletModal";
import { WalletDetailsModal } from "@/components/wallet/WalletDetailsModal";
import { getStore, saveStore, resetDemoState } from "@/lib/state/demoStore";
import { useWallet } from "@/context/WalletContext";
import { useTheme } from "@/context/ThemeContext";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [store, setStore] = useState(getStore());
  const { isConnected, address, balance } = useWallet();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [isTourOpen, setIsTourOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [walletDetailsOpen, setWalletDetailsOpen] = useState(false);

  const isLender = pathname.startsWith("/lender");

  useEffect(() => {
    const handleUpdate = () => setStore(getStore());
    window.addEventListener("tradetrust_store_updated", handleUpdate);
    return () => window.removeEventListener("tradetrust_store_updated", handleUpdate);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleSwitchMode = (mode: "merchant" | "lender") => {
    const updated = { ...store, currentRole: mode };
    saveStore(updated);
    setStore(updated);
    if (mode === "lender") {
      router.push("/lender");
    } else {
      router.push("/app");
    }
  };

  const acceptedOffersCount = store.offers.filter((o) => o.status === "accepted").length;

  const merchantLinks = [
    { label: "Overview", href: "/app", icon: LayoutDashboard },
    { label: "Apply for Capital", href: "/app/apply", icon: FilePlus, highlight: true },
    { label: "Offer Marketplace", href: "/app/offers", icon: Coins, count: store.offers.length },
    { label: "Repayments & Health", href: "/app/repayments", icon: CreditCard },
    { label: "Stress Simulator", href: "/app/stress-test", icon: LineChart },
    { label: "Privacy Center (ZK)", href: "/app/privacy", icon: ShieldCheck, badge: "ZK" },
    { label: "AI Commerce Agent", href: "/app/commerce", icon: ShoppingBag, badge: "AI" },
    { label: "Cash-Flow Passport", href: "/app/credentials", icon: Award, count: store.credentials.length },
    { label: "Onchain Activity", href: "/app/activity", icon: History },
  ];

  const lenderLinks = [
    { label: "Lender Dashboard", href: "/lender", icon: LayoutDashboard },
    { label: "Merchant Requests", href: "/lender/requests", icon: Users, count: store.requests.length },
    { label: "Active Agreements", href: "/lender/agreements", icon: FileCheck, count: acceptedOffersCount },
    { label: "Manage Offers", href: "/lender/offers", icon: Coins, count: store.offers.length },
    { label: "Repayment Ledger", href: "/lender/repayments", icon: Calendar },
    { label: "Portfolio Analytics", href: "/lender/analytics", icon: BarChart3 },
    { label: "Privacy Proof Audits", href: "/app/privacy", icon: Lock, badge: "Audit" },
  ];

  const currentNav = isLender ? lenderLinks : merchantLinks;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased transition-colors duration-200">
      <Navbar onOpenDemoTour={() => setIsTourOpen(true)} />

      {/* Guided Demo Tour Modal */}
      <DemoTourModal isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />

      {/* Connect Wallet Modal */}
      <ConnectWalletModal isOpen={connectModalOpen} onClose={() => setConnectModalOpen(false)} />

      {/* Wallet Details Popover Modal */}
      <WalletDetailsModal
        isOpen={walletDetailsOpen}
        onClose={() => setWalletDetailsOpen(false)}
        onOpenConnectModal={() => setConnectModalOpen(true)}
      />

      {/* Mobile Subnav Strip */}
      <div className="md:hidden sticky top-[72px] z-30 w-full px-4 py-2.5 bg-background/95 border-b border-theme backdrop-blur-md flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-theme text-xs font-semibold text-foreground"
        >
          {sidebarOpen ? <X className="w-4 h-4 text-mint" /> : <Menu className="w-4 h-4 text-mint" />}
          <span>{isLender ? "Lender Menu" : "Merchant Menu"}</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
          <span className="text-foreground-secondary">Base Sepolia</span>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6 relative">
        {/* Sidebar */}
        <aside
          className={`w-full md:w-64 shrink-0 space-y-4 ${
            sidebarOpen ? "block" : "hidden md:block"
          }`}
        >
          {/* 1. INTERACTIVE MODE SWITCHER CARD */}
          <div className="p-3.5 rounded-2xl bg-surface-card border border-theme shadow-sm space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-foreground-muted uppercase tracking-wider font-bold">
                Platform Mode
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  isLender
                    ? "bg-violet/20 text-violet border border-violet/30"
                    : "bg-mint/10 text-mint border border-mint/20"
                }`}
              >
                {isLender ? "LENDER" : "MERCHANT"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-surface border border-theme">
              <Link
                href="/app"
                onClick={() => handleSwitchMode("merchant")}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  !isLender
                    ? "bg-mint text-black font-extrabold shadow-sm"
                    : "text-foreground-secondary hover:text-foreground"
                }`}
                title="Switch to Merchant Mode"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Merchant</span>
              </Link>

              <Link
                href="/lender"
                onClick={() => handleSwitchMode("lender")}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isLender
                    ? "bg-violet text-white font-extrabold shadow-sm"
                    : "text-foreground-secondary hover:text-foreground"
                }`}
                title="Switch to Lender Mode"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Lender</span>
              </Link>
            </div>
          </div>

          {/* 2. WALLET STATUS CARD (Clean & Honest) */}
          <div className="p-3.5 rounded-2xl bg-surface-card border border-theme shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-foreground-muted uppercase tracking-wider font-bold">
                Web3 Wallet
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected && address ? "bg-mint animate-pulse" : "bg-amber-400"
                }`}
              />
            </div>

            {isConnected && address ? (
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between items-center text-foreground-secondary">
                  <span>Address:</span>
                  <span className="text-mint font-bold">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-foreground-secondary">
                  <span>Balance:</span>
                  <span className="text-foreground">{balance}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setWalletDetailsOpen(true)}
                  className="w-full mt-2 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-theme text-foreground text-xs font-semibold"
                >
                  Manage Wallet
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-foreground-secondary">No wallet connected</p>
                <button
                  type="button"
                  onClick={() => setConnectModalOpen(true)}
                  className="w-full py-2 rounded-lg bg-mint hover:bg-mint-muted text-black text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-mint-sm"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Connect Wallet</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. NAVIGATION LINKS */}
          <nav className="space-y-1">
            <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-foreground-muted mb-2">
              {isLender ? "Lender Workflows" : "Merchant Tools"}
            </p>
            {currentNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-mint/10 text-mint border border-mint/30 shadow-mint-sm"
                      : "text-foreground-secondary hover:text-foreground hover:bg-surface"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-mint" : "text-foreground-muted"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded bg-violet/20 text-violet border border-violet/30 text-[9px] font-mono font-bold">
                      {item.badge}
                    </span>
                  )}
                  {typeof item.count === "number" && (
                    <span className="px-1.5 py-0.5 rounded-full bg-surface border border-theme text-foreground-secondary text-[10px] font-mono">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-3 border-t border-theme space-y-1">
              <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-foreground-muted mb-2">System</p>
              <Link
                href="/settings"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  pathname === "/settings"
                    ? "bg-mint/10 text-mint border border-mint/20"
                    : "text-foreground-secondary hover:text-foreground hover:bg-surface"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings & Consent</span>
              </Link>
              <Link
                href="/docs"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  pathname === "/docs"
                    ? "bg-mint/10 text-mint border border-mint/20"
                    : "text-foreground-secondary hover:text-foreground hover:bg-surface"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Technical Docs</span>
              </Link>
            </div>
          </nav>

          {/* 4. EXPLICIT THEME SELECTOR IN SIDEBAR */}
          <div className="p-3 rounded-2xl bg-surface-card border border-theme text-xs space-y-2 shadow-sm">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-foreground-muted block">
              Appearance
            </span>
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-surface border border-theme">
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  resolvedTheme === "dark"
                    ? "bg-black text-mint border border-mint/40 shadow-sm"
                    : "text-foreground-secondary hover:text-foreground"
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-mint" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  resolvedTheme === "light"
                    ? "bg-white text-slate-900 border border-slate-300 shadow-sm"
                    : "text-foreground-secondary hover:text-foreground"
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>
            </div>
          </div>

          {/* 5. QUICK RESET DEMO CARD */}
          <div className="p-3 rounded-2xl bg-surface-card border border-theme text-xs space-y-2 shadow-sm">
            <button
              onClick={() => {
                if (confirm("Reset TradeTrust state back to pristine data?")) {
                  resetDemoState();
                  alert("Demo state reset successfully!");
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-theme text-foreground-secondary hover:text-foreground text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-foreground-muted" />
              <span>Reset Demo State</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
