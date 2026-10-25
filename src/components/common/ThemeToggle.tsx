"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle({ showLabel = true }: { showLabel?: boolean }) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div className="flex items-center p-1 rounded-xl bg-surface border border-theme shadow-sm">
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-label="Switch to Dark (True Black) Mode"
        title="Black Mode (#000000)"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
          resolvedTheme === "dark"
            ? "bg-black text-mint border border-mint/40 shadow-sm"
            : "text-foreground-secondary hover:text-foreground"
        }`}
      >
        <Moon className="w-3.5 h-3.5 text-mint" />
        <span className="hidden sm:inline">Dark</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-label="Switch to Light Mode"
        title="Light Mode (Crisp White)"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
          resolvedTheme === "light"
            ? "bg-white text-slate-900 border border-slate-300 shadow-sm"
            : "text-foreground-secondary hover:text-foreground"
        }`}
      >
        <Sun className="w-3.5 h-3.5 text-amber-500" />
        <span className="hidden sm:inline">Light</span>
      </button>
    </div>
  );
}
