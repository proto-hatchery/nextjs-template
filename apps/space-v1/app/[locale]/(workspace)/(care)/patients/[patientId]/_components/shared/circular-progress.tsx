"use client";

import { cn } from "@workspace/ui/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface CircularProgressProps {
  percentage: number;
  tone: "complete" | "partial" | "critical";
  isComplete: boolean;
}

export function CircularProgress({ percentage, tone, isComplete }: CircularProgressProps) {
  const normalized = Math.min(Math.max(percentage, 0), 100);
  const radius = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isComplete ? 0 : circumference - (normalized / 100) * circumference;

  const toneColor: Record<typeof tone, string> = {
    complete: "text-emerald-500",
    partial: "text-amber-500",
    critical: "text-rose-500",
  };

  return (
    <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
      {/* Progress circle SVG (ring) */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        role="img"
        aria-label={isComplete ? "Progresso completo" : `Progresso de ${Math.round(normalized)}%`}
        className="absolute text-muted-foreground"
      >
        {/* Background circle (outer ring) */}
        <circle
          className="text-muted-foreground/20"
          strokeWidth="2"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="10"
          cy="10"
        />
        {/* Anel de progresso */}
        <circle
          className={isComplete ? "text-emerald-500" : toneColor[tone]}
          strokeWidth="2"
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="10"
          cy="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      {/* Check Icon - always exists, only shows when complete */}
      <CheckCircle2
        className={cn(
          "absolute size-3.5 text-emerald-500 transition-opacity",
          isComplete ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
