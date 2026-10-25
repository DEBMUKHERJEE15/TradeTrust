import React from "react";
import Link from "next/link";
import { ShieldCheck, ExternalLink, Github, Terminal, Lock, Cpu, Globe } from "lucide-react";
import { CONTRACT_ADDRESSES } from "@/config/contracts";

export function Footer() {
  return (
    <footer className="w-full border-t border-theme bg-surface text-foreground-secondary text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-mint flex items-center justify-center text-black font-bold">
                <ShieldCheck className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <span className="font-bold text-base text-foreground">TradeTrust</span>
            </div>
            <p className="text-foreground-secondary leading-relaxed max-w-sm text-xs">
              Verified business credentials. Privacy-first financing. AI-powered commerce.
              Empowering local merchants with onchain working capital on Base Sepolia.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-card border border-theme text-[11px] font-mono text-mint">
                <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
                Base Sepolia Testnet
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-card border border-theme text-[11px] font-mono text-violet">
                <Lock className="w-3 h-3 text-violet" />
                Zcash Privacy Track
              </span>
            </div>
          </div>

          {/* Column 1: Product */}
          <div className="space-y-3">
            <h4 className="text-foreground font-semibold text-xs tracking-wider uppercase">Product</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/app" className="hover:text-mint transition-colors">
                  Merchant Dashboard
                </Link>
              </li>
              <li>
                <Link href="/app/apply" className="hover:text-mint transition-colors">
                  Financing Application
                </Link>
              </li>
              <li>
                <Link href="/app/offers" className="hover:text-mint transition-colors">
                  Offer Marketplace
                </Link>
              </li>
              <li>
                <Link href="/app/commerce" className="hover:text-mint transition-colors">
                  AI Commerce Agent
                </Link>
              </li>
              <li>
                <Link href="/lender" className="hover:text-mint transition-colors">
                  Lender Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Verifiable Infrastructure */}
          <div className="space-y-3">
            <h4 className="text-foreground font-semibold text-xs tracking-wider uppercase">Infrastructure</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/app/privacy" className="hover:text-mint transition-colors">
                  Zero-Knowledge Proofs
                </Link>
              </li>
              <li>
                <Link href="/app/credentials" className="hover:text-mint transition-colors">
                  Credential Registry
                </Link>
              </li>
              <li>
                <a
                  href={`https://sepolia-explorer.base.org/address/${CONTRACT_ADDRESSES.TradeTrustMarketplace}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-mint transition-colors flex items-center gap-1"
                >
                  <span>Marketplace Contract</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href={`https://sepolia-explorer.base.org/address/${CONTRACT_ADDRESSES.SpendingAuthorization}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-mint transition-colors flex items-center gap-1"
                >
                  <span>Spending Authorization</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href={`https://sepolia-explorer.base.org/address/${CONTRACT_ADDRESSES.ZKRevenueVerifier}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-mint transition-colors flex items-center gap-1"
                >
                  <span>ZK Verifier Contract</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Documentation */}
          <div className="space-y-3">
            <h4 className="text-foreground font-semibold text-xs tracking-wider uppercase">Documentation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/docs" className="hover:text-mint transition-colors">
                  Architecture Overview
                </Link>
              </li>
              <li>
                <Link href="/docs#zcash" className="hover:text-mint transition-colors">
                  Zcash Track Integration
                </Link>
              </li>
              <li>
                <Link href="/docs#bitrefill" className="hover:text-mint transition-colors">
                  Bitrefill API & Controls
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-mint transition-colors">
                  Consent & Keys
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="pt-6 border-t border-theme flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-foreground-muted">
          <p>
            <strong className="text-foreground-secondary">DISCLAIMER:</strong> TradeTrust is currently deployed on Base Sepolia Testnet (Chain ID 84532) for demonstration and hackathon review. All loan contracts, token transfers, and Bitrefill actions without live API keys execute in verified sandbox test environments.
          </p>
          <div className="flex items-center gap-4 text-foreground-secondary shrink-0">
            <span>© 2026 TradeTrust Protocol</span>
            <span>•</span>
            <span>All rights reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
