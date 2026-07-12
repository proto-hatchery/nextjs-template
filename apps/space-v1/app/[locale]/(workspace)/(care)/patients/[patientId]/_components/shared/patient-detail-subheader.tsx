"use client";

import { CircularProgress } from "./circular-progress";
import { CadastroBadge } from "./patient-detail-subheader-helpers";

interface PatientDetailSubheaderProps {
  title: string;
  progress?: {
    completed: number;
    total: number;
    percentage: number;
  } | null;
  children?: React.ReactNode;
  showCadastroBadge?: boolean;
}

function getCompletionTone(_percentage: number): "complete" | "partial" | "critical" {
  return "complete";
}

export function PatientDetailSubheader({
  title,
  progress,
  children,
  showCadastroBadge = true,
  customBadgeText,
  isBadgeSuccess,
}: PatientDetailSubheaderProps & { customBadgeText?: string; isBadgeSuccess?: boolean }) {
  const isComplete = progress ? progress.percentage >= 100 : false;
  const completionTone = progress ? getCompletionTone(progress.percentage) : "critical";

  // Determine if the badge should be green (success) or amber (warning)
  // If isBadgeSuccess is explicitly provided, use it. Otherwise fall back to isComplete.
  const isSuccess = isBadgeSuccess ?? isComplete;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-base font-medium text-foreground">{title}</span>
        {progress ? (
          <div className="flex items-center gap-2">
            <CircularProgress
              percentage={progress.percentage}
              tone={completionTone}
              isComplete={isComplete}
            />
            <span className="inline-flex items-baseline gap-1 text-sm font-semibold">
              <span className="text-foreground">{progress.completed}</span>
              <span className="text-muted-foreground">/ {progress.total}</span>
            </span>
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {progress && showCadastroBadge ? (
          customBadgeText ? (
            <div
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                isSuccess
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
              }`}
            >
              {customBadgeText}
            </div>
          ) : (
            <CadastroBadge percentage={progress.percentage} />
          )
        ) : null}
        {children}
      </div>
    </div>
  );
}
