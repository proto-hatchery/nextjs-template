"use client";

import type { ReactNode } from "react"

import { cn } from "@workspace/ui/lib/utils"

import { usePrivacyMode } from "./privacy-provider"

type SensitiveProps = {
  children: ReactNode
  variant?: "blur" | "redact"
  redactedLabel?: string
  className?: string
  as?: React.ElementType
}

export function Sensitive({
  children,
  variant = "blur",
  redactedLabel = "Oculto por privacidade",
  className,
  as: Component = "span",
}: SensitiveProps) {
  const { isVisible } = usePrivacyMode()

  if (isVisible) {
    return <Component className={className}>{children}</Component>
  }

  if (variant === "redact") {
    return (
      <Component
        className={cn("redacted-text", className)}
        aria-label={redactedLabel}
        aria-hidden="true"
      >
        •••••••••
      </Component>
    )
  }

  return (
    <Component
      className={cn("blur-sensitive", className)}
      aria-label={redactedLabel}
      aria-hidden="true"
    >
      {children}
    </Component>
  )
}
