"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Coins,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info
} from "lucide-react";

export interface WorkflowStage {
  id: string;
  stepNumber: string;
  title: string;
  headline: string;
  description: string;
  timestampSeconds: number;
  durationSeconds: number;
  icon: React.ElementType;
  badge: string;
  badgeColor: string;
  screenshotFallback: string;
}

export const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: "verify",
    stepNumber: "01",
    title: "Verify",
    headline: "Submit business evidence & review verification",
    description:
      "The merchant submits point-of-sale turnover, bank statements, or wholesale invoices into encrypted local storage. Hashed commitments are registered without leaking raw statements.",
    timestampSeconds: 0,
    durationSeconds: 15,
    icon: CheckCircle2,
    badge: "Evidence Verification",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    screenshotFallback: "/demo/stage-01-verify.png",
  },
  {
    id: "protect",
    stepNumber: "02",
    title: "Protect",
    headline: "Zero-Knowledge eligibility verification",
    description:
      "A Groth16 range proof mathematically proves monthly revenue satisfies lender underwriting thresholds (>= $15,000/mo) while customer names and commercial margins remain 100% private.",
    timestampSeconds: 15,
    durationSeconds: 15,
    icon: Lock,
    badge: "Zcash Privacy Track",
    badgeColor: "bg-violet/10 text-violet-300 border-violet/20",
    screenshotFallback: "/demo/stage-02-protect.png",
  },
  {
    id: "discover",
    stepNumber: "03",
    title: "Discover",
    headline: "Compare offers & onchain acceptance",
    description:
      "Merchants evaluate competing lender terms on Base Sepolia, inspecting annualized APRs, origination fees, and monthly debt-service ratios before signing onchain.",
    timestampSeconds: 30,
    durationSeconds: 15,
    icon: Coins,
    badge: "Base Sepolia (84532)",
    badgeColor: "bg-mint/10 text-mint border-mint/20",
    screenshotFallback: "/demo/stage-03-discover.png",
  },
  {
    id: "execute",
    stepNumber: "04",
    title: "Execute",
    headline: "AI commerce agent & explicit approval",
    description:
      "The merchant expresses a purchasing goal (POS airtime, utility vouchers, store supplies). The AI agent prepares an exact proposal and executes only upon explicit user confirmation.",
    timestampSeconds: 45,
    durationSeconds: 15,
    icon: ShoppingBag,
    badge: "Bitrefill Commerce",
    badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    screenshotFallback: "/demo/stage-04-execute.png",
  },
];

export function ProductDemoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(60);
  const [isMuted, setIsMuted] = useState(true);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Synchronize active stage index based on current playback time
  useEffect(() => {
    const stage = WORKFLOW_STAGES.findIndex(
      (s, idx) =>
        currentTime >= s.timestampSeconds &&
        (idx === WORKFLOW_STAGES.length - 1 || currentTime < WORKFLOW_STAGES[idx + 1].timestampSeconds)
    );
    if (stage !== -1 && stage !== currentStageIndex) {
      setCurrentStageIndex(stage);
      setActiveSlideIndex(stage);
    }
  }, [currentTime, currentStageIndex]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => setVideoError(true));
      setIsPlaying(true);
      setHasStartedPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleSelectStage = (index: number) => {
    setCurrentStageIndex(index);
    setActiveSlideIndex(index);
    const targetSeconds = WORKFLOW_STAGES[index].timestampSeconds;
    setCurrentTime(targetSeconds);

    if (videoRef.current) {
      videoRef.current.currentTime = targetSeconds;
      videoRef.current.play().catch(() => setVideoError(true));
      setIsPlaying(true);
      setHasStartedPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const activeStage = WORKFLOW_STAGES[currentStageIndex];

  return (
    <div className="space-y-8">
      {/* 16:9 Video Player Container */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl bg-surface-card border border-theme shadow-2xl overflow-hidden group focus-within:ring-2 focus-within:ring-mint"
      >
        {/* Top Header Bar of the Embedded Terminal */}
        <div className="px-4 py-2.5 bg-surface border-b border-theme flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-foreground-secondary text-[11px] ml-1.5 hidden sm:inline">
              TradeTrust Terminal • Full Product Walkthrough
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${activeStage.badgeColor}`}>
              {activeStage.badge}
            </span>
            <span className="text-foreground-muted text-[10px] font-mono">1080p 60fps</span>
          </div>
        </div>

        {/* Video / Fallback Viewport */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {!videoError ? (
            <video
              ref={videoRef}
              src="/demo/tradetrust-demo.mp4"
              poster="/demo/tradetrust-demo-poster.png"
              muted={isMuted}
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => {
                setIsPlaying(false);
                setCurrentTime(0);
              }}
              onError={() => setVideoError(true)}
              className="w-full h-full object-contain cursor-pointer"
              onClick={togglePlay}
            />
          ) : (
            /* Interactive Real Screen Fallback */
            <div className="relative w-full h-full flex flex-col justify-between p-6 bg-surface text-foreground">
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-mint/10 text-mint border border-mint/20">
                  Interactive Product Preview: {WORKFLOW_STAGES[activeSlideIndex].stepNumber} — {WORKFLOW_STAGES[activeSlideIndex].title}
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  {WORKFLOW_STAGES[activeSlideIndex].headline}
                </h3>
                <p className="text-xs text-foreground-secondary max-w-xl leading-relaxed">
                  {WORKFLOW_STAGES[activeSlideIndex].description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-theme">
                <div className="flex gap-2">
                  {WORKFLOW_STAGES.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveSlideIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        activeSlideIndex === idx
                          ? "bg-mint text-[#050811]"
                          : "bg-[#0E1626] text-slate-400 hover:text-white"
                      }`}
                    >
                      {s.stepNumber}
                    </button>
                  ))}
                </div>

                <span className="text-xs font-mono text-slate-400">
                  Slide {activeSlideIndex + 1} of {WORKFLOW_STAGES.length}
                </span>
              </div>
            </div>
          )}

          {/* Large Central Overlay Play Button before start / on pause */}
          {!isPlaying && !videoError && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer group/overlay transition-all"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-mint text-[#050811] flex items-center justify-center shadow-mint-md group-hover/overlay:scale-110 transition-transform duration-200">
                <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
              </div>
              <p className="text-white text-xs font-bold mt-3 tracking-wide drop-shadow">
                {hasStartedPlaying ? "Resume Demo Video" : "Watch 60-Second Demo Video"}
              </p>
              <span className="text-slate-300 text-[11px] font-mono mt-0.5">
                Real TradeTrust Application Recording
              </span>
            </div>
          )}
        </div>

        {/* Video Controls Bar */}
        {!videoError && (
          <div className="p-3 bg-surface border-t border-theme flex flex-col gap-2">
            {/* Scrubber Timeline */}
            <div className="relative w-full flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 60}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                aria-label="Video Seek Scrubber"
                className="w-full h-1.5 rounded-lg bg-surface-hover appearance-none cursor-pointer accent-mint focus:outline-none"
              />
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between text-xs text-foreground-secondary">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause Video" : "Play Video"}
                  className="p-1 rounded text-foreground hover:text-mint transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>

                <button
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute Video" : "Mute Video"}
                  className="p-1 rounded text-foreground hover:text-mint transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-foreground-muted" /> : <Volume2 className="w-4 h-4 text-mint" />}
                </button>

                <span className="font-mono text-[11px] text-foreground-muted">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Current Active Chapter Label */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[10px] font-mono text-foreground-muted">Chapter:</span>
                <span data-testid="active-chapter-label" className="text-xs font-mono font-bold text-mint">
                  {activeStage.stepNumber} — {activeStage.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleFullscreen}
                  aria-label="Toggle Fullscreen"
                  className="p-1 rounded text-foreground hover:text-mint transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4-Stage Interactive Synchronized Workflow Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-mint" /> Interactive 4-Stage Workflow
          </h3>
          <span className="text-xs text-foreground-muted">
            Click any stage to scrub directly to that chapter in the video
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {WORKFLOW_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = currentStageIndex === idx;

            return (
              <button
                key={stage.id}
                onClick={() => handleSelectStage(idx)}
                className={`text-left p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 group ${
                  isActive
                    ? "bg-surface-card border-mint shadow-mint-sm ring-1 ring-mint/40"
                    : "bg-surface border-theme hover:border-mint/50 hover:bg-surface-hover"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-2xl font-black font-mono transition-colors ${
                        isActive ? "text-mint" : "text-foreground-muted group-hover:text-foreground"
                      }`}
                    >
                      {stage.stepNumber}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${stage.badgeColor}`}>
                      {stage.title}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-foreground group-hover:text-mint transition-colors">
                    {stage.headline}
                  </h4>

                  <p className="text-xs text-foreground-secondary leading-relaxed">{stage.description}</p>
                </div>

                <div className="pt-2 border-t border-theme flex items-center justify-between text-[11px] font-mono">
                  <span className={isActive ? "text-mint font-bold" : "text-foreground-muted"}>
                    {isActive ? "● Now Playing" : `Seek to ${formatTime(stage.timestampSeconds)}`}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? "text-mint translate-x-0.5" : "text-foreground-muted group-hover:translate-x-0.5"}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
