"use client";

import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/lib/utils";
import { CheckIcon, XIcon } from "lucide-react";

// ============================================================================
// Loading Icon
// ============================================================================

interface LoadingIconProps {
  className?: string;
}

export function LoadingIcon({ className }: LoadingIconProps) {
  return (
    <div
      className={cn(
        "flex h-20 w-20 items-center justify-center rounded-full bg-primary/10",
        className,
      )}
    >
      <Spinner className="size-10 text-primary" />
    </div>
  );
}

// ============================================================================
// Success Icon
// ============================================================================

interface SuccessIconProps {
  className?: string;
}

export function SuccessIcon({ className }: SuccessIconProps) {
  return (
    <div
      className={cn(
        "flex h-20 w-20 items-center justify-center rounded-full bg-green-100",
        className,
      )}
    >
      <CheckIcon className="size-10 text-green-600" strokeWidth={2} />
    </div>
  );
}

// ============================================================================
// Error Icon
// ============================================================================

interface ErrorIconProps {
  className?: string;
}

export function ErrorIcon({ className }: ErrorIconProps) {
  return (
    <div
      className={cn(
        "flex h-20 w-20 items-center justify-center rounded-full bg-red-100",
        className,
      )}
    >
      <XIcon className="size-10 text-red-500" strokeWidth={2} />
    </div>
  );
}
