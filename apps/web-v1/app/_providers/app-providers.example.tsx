"use client"

import type { ReactNode } from "react"

import { AppProviders as WorkspaceAppProviders } from "@workspace/core/providers/app"

/**
 * Example app — thin wrapper around `@workspace/core` providers.
 *
 * **Naming:** `*.example.tsx` marks files that belong to this **template app** (`apps/example`)
 * and should be renamed or adjusted when you fork into a real product app.
 *
 * Shared implementation stays in `packages/core` (see `docs/architecture/core-package.md`).
 *
 * Add app-only providers here (wrap `WorkspaceAppProviders`). For app-local **hooks**, use
 * `app/_hooks/*.example.ts` instead.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return <WorkspaceAppProviders>{children}</WorkspaceAppProviders>
}
