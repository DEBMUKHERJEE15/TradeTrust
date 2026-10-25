"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sliders,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Info,
  DollarSign,
  Calendar,
  Sparkles
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getStore } from "@/lib/state/demoStore";

export default function CashFlowStressSimulatorPage() {
  const store = getStore();

  // Baseline merchant financials
  const baseRevenue = store.merchantProfile.monthlyRevenueEstimate || 24500;
  const baseExpenses = store.merchantProfile.monthlyExpensesEstimate || 16200;
  const baseDebtService = store.agreements[0]?.installmentAmount || 462.50;

  // Simulator Controls
  const [salesShockPercent, setSalesShockPercent] = useState<number>(-15); // e.g. -15%
  const [expenseSpikePercent, setExpenseSpikePercent] = useState<number>(10); // e.g. +10%
  const [paymentDelayDays, setPaymentDelayDays] = useState<number>(14); // 14 days delay
  const [proposedDebtService, setProposedDebtService] = useState<number>(baseDebtService);

  // Calculations
  const simulatedRevenue = Math.max(0, baseRevenue * (1 + salesShockPercent / 100));
  const simulatedExpenses = baseExpenses * (1 + expenseSpikePercent / 100);

  // Collection delay impact: cash flow haircut for the month
  const delayHaircut = simulatedRevenue * (paymentDelayDays / 90);
  const effectiveMonthlyCashIn = Math.max(0, simulatedRevenue - delayHaircut);

  const netOperatingCashFlow = effectiveMonthlyCashIn - simulatedExpenses;
  const monthlySurplusDeficit = netOperatingCashFlow - proposedDebtService;

  // Debt Service Coverage Ratio (DSCR)
  const dscr = proposedDebtService > 0 ? netOperatingCashFlow / proposedDebtService : 99;

  let healthStatus: "resilient" | "moderate" | "distressed" = "resilient";
  let statusBadgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  let statusText = "Resilient (Low Default Risk)";

  if (dscr < 1.0 || monthlySurplusDeficit < 0) {
    healthStatus = "distressed";
    statusBadgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/30";
    statusText = "Distressed (Cash Shortfall Projected)";
  } else if (dscr < 1.35) {
    healthStatus = "moderate";
    statusBadgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/30";
    statusText = "Moderate (Thin Buffer)";
  }

  const handleReset = () => {
    setSalesShockPercent(0);
    setExpenseSpikePercent(0);
    setPaymentDelayDays(0);
    setProposedDebtService(baseDebtService);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-theme">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-mint/10 text-mint border border-mint/20 font-bold uppercase">
                SCENARIO MODELING
              </span>
              <span className="text-xs text-foreground-secondary font-mono">Financial Resiliency Engine</span>
            </div>
            <h1 className="text-xl font-extrabold text-foreground mt-1">Cash-Flow Stress Simulator</h1>
            <p className="text-xs text-foreground-secondary">
              Simulate sales downturns, supplier cost inflation, and receivable delays to assess repayment safety.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="px-3.5 py-1.5 rounded-xl bg-surface hover:bg-surface-hover border border-theme text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-foreground-muted" />
            <span>Reset to Baseline</span>
          </button>
        </div>

        {/* Disclaimer Callout */}
        <div className="p-4 rounded-xl bg-surface-card border border-theme flex items-start gap-3 text-xs text-foreground-secondary">
          <Info className="w-4 h-4 text-mint shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-foreground">Transparent Methodology:</strong> This simulator provides scenario-based cash-flow forecasts using merchant historical baselines. It does not guarantee credit decisions or constitute deterministic future predictions.
          </p>
        </div>

        {/* Main Grid: Controls on Left, Results on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Panel (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-5 rounded-2xl bg-surface-card border border-theme space-y-5 shadow-xl text-xs">
              <div className="pb-3 border-b border-theme flex items-center justify-between">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-mint" />
                  Shock Scenario Variables
                </h3>
                <span className="text-[10px] font-mono text-foreground-muted">Interactive Sliders</span>
              </div>

              {/* Slider 1: Sales Revenue Shock */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground font-semibold">Sales Revenue Drop / Gain</span>
                  <span className={`font-mono font-bold ${salesShockPercent < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {salesShockPercent > 0 ? `+${salesShockPercent}%` : `${salesShockPercent}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={20}
                  step={5}
                  value={salesShockPercent}
                  onChange={(e) => setSalesShockPercent(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg bg-surface appearance-none cursor-pointer accent-mint focus:outline-none"
                />
                <div className="flex justify-between text-[10px] font-mono text-foreground-muted">
                  <span>-50% (Extreme Downturn)</span>
                  <span>0% (Baseline)</span>
                  <span>+20% (Peak Season)</span>
                </div>
              </div>

              {/* Slider 2: Operating Expense Spike */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground font-semibold">Expense & Supplier Inflation</span>
                  <span className="font-mono font-bold text-amber-500">+{expenseSpikePercent}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={5}
                  value={expenseSpikePercent}
                  onChange={(e) => setExpenseSpikePercent(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg bg-surface appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] font-mono text-foreground-muted">
                  <span>+0% (Current)</span>
                  <span>+25% (Moderate Shock)</span>
                  <span>+50% (Severe Inflation)</span>
                </div>
              </div>

              {/* Slider 3: Collection / Receivable Delay */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground font-semibold">Customer Payment Delay</span>
                  <span className="font-mono font-bold text-violet">{paymentDelayDays} Days</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={45}
                  step={3}
                  value={paymentDelayDays}
                  onChange={(e) => setPaymentDelayDays(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg bg-surface appearance-none cursor-pointer accent-violet focus:outline-none"
                />
                <div className="flex justify-between text-[10px] font-mono text-foreground-muted">
                  <span>0 Days (Instant POS)</span>
                  <span>14 Days (Invoiced Net-14)</span>
                  <span>45 Days (Extended Terms)</span>
                </div>
              </div>

              {/* Slider 4: Proposed Debt Service Payment */}
              <div className="space-y-2 pt-2 border-t border-theme">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground font-semibold">Monthly Financing Obligation</span>
                  <span className="font-mono font-bold text-mint">${proposedDebtService.toFixed(2)} / mo</span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={2500}
                  step={50}
                  value={proposedDebtService}
                  onChange={(e) => setProposedDebtService(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg bg-surface appearance-none cursor-pointer accent-mint focus:outline-none"
                />
                <div className="flex justify-between text-[10px] font-mono text-foreground-muted">
                  <span>$200 (Micro Facility)</span>
                  <span>${baseDebtService.toFixed(0)} (Current)</span>
                  <span>$2,500 (Expansion Loan)</span>
                </div>
              </div>
            </div>

            {/* Baseline Merchant Context Box */}
            <div className="p-4 rounded-xl bg-surface border border-theme space-y-2 text-xs">
              <span className="text-[10px] font-mono uppercase text-foreground-muted">Baseline Business Parameters</span>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div>
                  <span className="text-foreground-secondary block">Monthly Sales:</span>
                  <strong className="text-foreground">${baseRevenue.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-foreground-secondary block">Operating Costs:</span>
                  <strong className="text-foreground">${baseExpenses.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Results & Health Meter (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Health Meter Card */}
            <div className="p-6 rounded-2xl bg-surface-card border border-theme shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-theme">
                <div>
                  <span className="text-[10px] font-mono text-foreground-muted uppercase">Coverage Assessment</span>
                  <h3 className="text-lg font-bold text-foreground">Debt Service Coverage Ratio (DSCR)</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border uppercase ${statusBadgeColor}`}>
                  {statusText}
                </span>
              </div>

              {/* Big Metric Display */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
                <div className="p-4 rounded-xl bg-surface border border-theme">
                  <span className="text-[10px] uppercase text-foreground-secondary">Simulated DSCR</span>
                  <p className="text-3xl font-black text-foreground mt-1">
                    {dscr < 0 ? "0.00x" : `${dscr.toFixed(2)}x`}
                  </p>
                  <p className="text-[10px] text-foreground-muted mt-1 font-sans">
                    {dscr >= 1.3 ? "Safe Buffer" : dscr >= 1.0 ? "Adequate" : "Shortfall"}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-theme">
                  <span className="text-[10px] uppercase text-foreground-secondary">Net Operating Cash</span>
                  <p className={`text-2xl font-black mt-1 ${netOperatingCashFlow >= 0 ? "text-foreground" : "text-rose-400"}`}>
                    ${netOperatingCashFlow.toFixed(0)}
                  </p>
                  <p className="text-[10px] text-foreground-muted mt-1 font-sans">Effective inflows less costs</p>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-theme">
                  <span className="text-[10px] uppercase text-foreground-secondary">Monthly Net Buffer</span>
                  <p className={`text-2xl font-black mt-1 ${monthlySurplusDeficit >= 0 ? "text-mint" : "text-rose-400"}`}>
                    {monthlySurplusDeficit >= 0 ? `+$${monthlySurplusDeficit.toFixed(0)}` : `-$${Math.abs(monthlySurplusDeficit).toFixed(0)}`}
                  </p>
                  <p className="text-[10px] text-foreground-muted mt-1 font-sans">After loan debt service</p>
                </div>
              </div>

              {/* Waterfall Breakdown Table */}
              <div className="p-4 rounded-xl bg-surface border border-theme space-y-2 text-xs font-mono">
                <span className="text-[10px] uppercase text-foreground-muted block mb-2 font-sans font-bold">
                  Simulated Cash-Flow Waterfall
                </span>
                <div className="flex justify-between py-1 border-b border-theme text-foreground">
                  <span>Gross Sales (Adjusted {salesShockPercent}%):</span>
                  <span>${simulatedRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-theme text-rose-400">
                  <span>Operating Expenses (+{expenseSpikePercent}%):</span>
                  <span>-${simulatedExpenses.toFixed(2)}</span>
                </div>
                {paymentDelayDays > 0 && (
                  <div className="flex justify-between py-1 border-b border-theme text-amber-400">
                    <span>Receivable Delay Liquidity Gap ({paymentDelayDays}d):</span>
                    <span>-${delayHaircut.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-theme text-violet">
                  <span>Scheduled Loan Installment:</span>
                  <span>-${proposedDebtService.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-bold">
                  <span className="text-foreground">Projected Free Cash Surplus:</span>
                  <span className={monthlySurplusDeficit >= 0 ? "text-mint" : "text-rose-400"}>
                    ${monthlySurplusDeficit.toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-foreground">Strategic Recommendations:</span>
                <ul className="space-y-1.5 text-xs text-foreground-secondary">
                  {healthStatus === "resilient" && (
                    <>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>High debt capacity: Store can comfortably absorb unexpected 15% revenue swings without missing debt service.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Recommended action: You can safely accept offers with up to $1,500/month in installment payments.</span>
                      </li>
                    </>
                  )}
                  {healthStatus === "moderate" && (
                    <>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>Thin coverage: A combined supplier price increase and sales dip would leave less than $500 monthly buffer.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>Recommended action: Request longer loan tenures (18-24 months) to reduce monthly obligations.</span>
                      </li>
                    </>
                  )}
                  {healthStatus === "distressed" && (
                    <>
                      <li className="flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span>Negative buffer alert: Simulated cash flow fails to cover debt payments. Risk of default under these parameters.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span>Recommended action: Negotiate an APR reduction or smaller principal before signing agreement.</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Navigation CTA */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/app/offers"
                  className="flex-1 py-2.5 rounded-xl bg-mint hover:bg-mint-muted text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-mint-sm"
                >
                  <span>Compare Offers with this Simulation</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/app/repayments"
                  className="py-2.5 px-4 rounded-xl bg-surface hover:bg-surface-hover border border-theme text-foreground text-xs font-semibold text-center"
                >
                  View Active Schedule
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
