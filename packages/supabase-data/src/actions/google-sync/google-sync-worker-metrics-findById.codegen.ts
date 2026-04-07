/**
 * FindByIdGoogleSyncWorkerMetrics Server Action
 * 
 * Handles findById operation for google_sync_worker_metrics.
 * 
 * ## Usage
 * 
 * Example:
 * ```typescript
 * import { findByIdGoogleSyncWorkerMetricsAction } from "@workspace/supabase-data/actions/google-sync/google-sync-worker-metrics-findById.codegen"
 * 
 * const result = await findByIdGoogleSyncWorkerMetricsAction(input)
 * ```
 * 
 * @module @workspace/supabase-data/actions/google-sync/google-sync-worker-metrics-findById
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { GoogleSyncWorkerMetricsSupabaseRepository } from "@workspace/supabase-data/modules/google-sync/infrastructure/repositories/google-sync-worker-metrics-supabase.repository.codegen"
import { logServerEvent } from "@workspace/logging/server"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"

/**
 * Audit-safe fields for this table (HIPAA §164.312(b) compliant)
 * 
 * These fields are safe to log in error metadata without exposing PHI.
 */
const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

/**
 * Input schema for findByIdGoogleSyncWorkerMetricsAction
 * 
 * Uses Zod v4 syntax (top-level APIs, not z.string().email() etc.)
 */
const GoogleSyncWorkerMetricsFindByIdInputSchema = z.object({
  // TODO: Define input fields based on google_sync_worker_metrics.findById requirements
  // Example for insert (Zod v4 syntax):
  // email: z.email({ error: "Invalid email" }),
  // id: z.uuid({ error: "Invalid UUID" }),
  // url: z.url({ error: "Invalid URL" }),
  // datetime: z.iso.datetime({ error: "Invalid datetime" }),
  // metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Input type for findByIdGoogleSyncWorkerMetricsAction
 */
export type GoogleSyncWorkerMetricsFindByIdInput = z.infer<typeof GoogleSyncWorkerMetricsFindByIdInputSchema>

/**
 * Output type for findByIdGoogleSyncWorkerMetricsAction — unknown until the action is wired to real DTOs / port types.
 */
export type GoogleSyncWorkerMetricsFindByIdOutput = unknown

/**
 * FindByIdGoogleSyncWorkerMetrics Server Action
 * 
 * @param input - Action input
 */
export async function findByIdGoogleSyncWorkerMetricsAction(
  input: GoogleSyncWorkerMetricsFindByIdInput
): Promise<GoogleSyncWorkerMetricsFindByIdOutput> {
  const startedAt = Date.now()
  let actorIdForLog = "unknown"

  try {
    // 1. Identity + rate limit (SSOT via requireAuth)
    const { userId } = await requireAuth({
      action: "findById_google-sync-worker-metrics",
    })
    actorIdForLog = userId
    // 2. Input validation — before any DB call
    const validated = GoogleSyncWorkerMetricsFindByIdInputSchema.parse(input)

    // 3. Auth client — created after all guards pass
    const supabase = await createServerAuthClient()
    const repository = new GoogleSyncWorkerMetricsSupabaseRepository(supabase)
    
    // 4. Execute operation — pass resolved context explicitly
    // @type-escape: generated action stub — id shape from validated after TODO input schema
    const result = await repository.findById((validated as unknown as { id: string }).id)

    // 5. Log success
    await logServerEvent({
      actorId: userId,
      actorType: "user",
      component: "google-sync.google-sync-worker-metrics.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_google-sync-worker-metrics_success",
      operation: "findById",
      operationType: "action",
      outcome: "success",
      service: "supabase-data",
    })

    return result
  } catch (error) {
    // 6. Log error with sanitized metadata (HIPAA compliant)
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "google-sync.google-sync-worker-metrics.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_google-sync-worker-metrics_failed",
      operation: "findById",
      operationType: "action",
      outcome: "failure",
      error,
      metadata: sanitizeForAudit(input as Record<string, unknown>, AUDIT_SAFE_FIELDS),
      service: "supabase-data",
    })

    throw error
  }
}
