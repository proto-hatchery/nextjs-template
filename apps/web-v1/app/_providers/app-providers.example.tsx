"use client"

import type { ReactNode } from "react"

import { AppProviders as WorkspaceAppProviders } from "@workspace/core/providers/app"

/**
 * Web app — thin wrapper around `@workspace/core` providers.
 *
 * Shared implementation stays in `packages/core` (see `docs/architecture/core-package.md`).
 *
 * Add app-only providers here (wrap `WorkspaceAppProviders`). For app-local **hooks**, use
 * `app/_hooks/*` instead.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return <WorkspaceAppProviders>{children}</WorkspaceAppProviders>
}
