/**
 * FindByIdObservabilityEvents Server Action
 * 
 * Handles findById operation for observability_events.
 * 
 * ## Usage
 * 
 * Example:
 * ```typescript
 * import { findByIdObservabilityEventsAction } from "@workspace/supabase-data/actions/observability/observability-events-findById.codegen"
 * 
 * const result = await findByIdObservabilityEventsAction(input)
 * ```
 * 
 * @module @workspace/supabase-data/actions/observability/observability-events-findById
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { ObservabilityEventsSupabaseRepository } from "@workspace/supabase-data/modules/observability/infrastructure/repositories/observability-events-supabase.repository.codegen"
import { logServerEvent } from "@workspace/logging/server"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"

/**
 * Audit-safe fields for this table (HIPAA §164.312(b) compliant)
 * 
 * These fields are safe to log in error metadata without exposing PHI.
 */
const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

/**
 * Input schema for findByIdObservabilityEventsAction
 * 
 * Uses Zod v4 syntax (top-level APIs, not z.string().email() etc.)
 */
const ObservabilityEventsFindByIdInputSchema = z.object({
  // TODO: Define input fields based on observability_events.findById requirements
  // Example for insert (Zod v4 syntax):
  // email: z.email({ error: "Invalid email" }),
  // id: z.uuid({ error: "Invalid UUID" }),
  // url: z.url({ error: "Invalid URL" }),
  // datetime: z.iso.datetime({ error: "Invalid datetime" }),
  // metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Input type for findByIdObservabilityEventsAction
 */
export type ObservabilityEventsFindByIdInput = z.infer<typeof ObservabilityEventsFindByIdInputSchema>

/**
 * Output type for findByIdObservabilityEventsAction — unknown until the action is wired to real DTOs / port types.
 */
export type ObservabilityEventsFindByIdOutput = unknown

/**
 * FindByIdObservabilityEvents Server Action
 * 
 * @param input - Action input
 */
export async function findByIdObservabilityEventsAction(
  input: ObservabilityEventsFindByIdInput
): Promise<ObservabilityEventsFindByIdOutput> {
  const startedAt = Date.now()
  let actorIdForLog = "unknown"

  try {
    // 1. Identity + rate limit (SSOT via requireAuth)
    const { userId } = await requireAuth({
      action: "findById_observability-events",
    })
    actorIdForLog = userId
    // 2. Input validation — before any DB call
    const validated = ObservabilityEventsFindByIdInputSchema.parse(input)

    // 3. Auth client — created after all guards pass
    const supabase = await createServerAuthClient()
    const repository = new ObservabilityEventsSupabaseRepository(supabase)
    
    // 4. Execute operation — pass resolved context explicitly
    // @type-escape: generated action stub — id shape from validated after TODO input schema
    const result = await repository.findById((validated as unknown as { id: string }).id)

    // 5. Log success
    await logServerEvent({
      actorId: userId,
      actorType: "user",
      component: "observability.observability-events.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_observability-events_success",
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
      component: "observability.observability-events.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_observability-events_failed",
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
