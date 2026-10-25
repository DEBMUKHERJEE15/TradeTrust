"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  History,
  ExternalLink,
  ShieldCheck,
  Coins,
  ShoppingBag,
  Layers,
  Filter,
  CheckCircle2,
  Clock
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getStore } from "@/lib/state/demoStore";

export default function ActivityHistoryPage() {
  const [store, setStore] = useState(getStore());
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    const handleUpdate = () => setStore(getStore());
    window.addEventListener("tradetrust_store_updated", handleUpdate);
    return () => window.removeEventListener("tradetrust_store_updated", handleUpdate);
  }, []);

  const logs = store.activityLogs.filter(
    (log) => filterCategory === "all" || log.category === filterCategory
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-mint/10 text-mint border border-mint/20 font-bold uppercase">
                DEMO DATA
              </span>
              <span className="text-xs text-foreground-secondary font-mono">Base Sepolia Audit Log</span>
            </div>
            <h1 className="text-xl font-extrabold text-foreground mt-1">Onchain Activity & Audit Trail</h1>
            <p className="text-xs text-foreground-secondary">
              Traceable history of financing requests, ZK privacy proofs, offers, and agent spending events.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            {["all", "financing", "privacy", "commerce", "onchain"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                  filterCategory === cat
                    ? "bg-mint text-black font-bold"
                    : "bg-[#0F182A] text-foreground-secondary hover:text-foreground border border-theme"
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Log List */}
        <div className="space-y-3">
          {logs.map((log) => {
            const timeAgo = Math.round((Date.now() - log.timestamp) / (3600 * 1000));

            return (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-surface-card border border-theme hover:border-mint/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-sm">{log.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-[#162238] text-foreground-secondary border border-theme">
                      {log.category.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-foreground-muted font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo}h ago
                    </span>
                  </div>
                  <p className="text-xs text-foreground-secondary leading-relaxed">{log.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {log.txHash ? (
                    <a
                      href={`https://sepolia-explorer.base.org/tx/${log.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-surface border border-theme hover:border-mint text-mint font-mono text-[11px] flex items-center gap-1.5 transition-colors"
                    >
                      <span>BaseScan Tx</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] font-mono text-foreground-muted">Offchain Verified</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
