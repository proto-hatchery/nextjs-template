/**
 * ListReferenceValues Server Action
 * 
 * Handles list operation for reference_values.
 * 
 * ## Usage
 * 
 * Example:
 * ```typescript
 * import { listReferenceValuesAction } from "@workspace/supabase-data/actions/catalog/reference-values-list.codegen"
 * 
 * const result = await listReferenceValuesAction(input)
 * ```
 * 
 * @module @workspace/supabase-data/actions/catalog/reference-values-list
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { ReferenceValuesSupabaseRepository } from "@workspace/supabase-data/modules/catalog/infrastructure/repositories/reference-values-supabase.repository.codegen"
import { logServerEvent } from "@workspace/logging/server"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"

/**
 * Audit-safe fields for this table (HIPAA §164.312(b) compliant)
 * 
 * These fields are safe to log in error metadata without exposing PHI.
 */
const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

/**
 * Input schema for listReferenceValuesAction
 * 
 * Uses Zod v4 syntax (top-level APIs, not z.string().email() etc.)
 */
const ReferenceValuesListInputSchema = z.object({
  // TODO: Define input fields based on reference_values.list requirements
  // Example for insert (Zod v4 syntax):
  // email: z.email({ error: "Invalid email" }),
  // id: z.uuid({ error: "Invalid UUID" }),
  // url: z.url({ error: "Invalid URL" }),
  // datetime: z.iso.datetime({ error: "Invalid datetime" }),
  // metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Input type for listReferenceValuesAction
 */
export type ReferenceValuesListInput = z.infer<typeof ReferenceValuesListInputSchema>

/**
 * Output type for listReferenceValuesAction — unknown until the action is wired to real DTOs / port types.
 */
export type ReferenceValuesListOutput = unknown

/**
 * ListReferenceValues Server Action
 * 
 * @param input - Action input
 */
export async function listReferenceValuesAction(
  input: ReferenceValuesListInput
): Promise<ReferenceValuesListOutput> {
  const startedAt = Date.now()
  let actorIdForLog = "unknown"

  try {
    // 1. Identity + rate limit (SSOT via requireAuth)
    const { userId } = await requireAuth({
      action: "list_reference-values",
    })
    actorIdForLog = userId
    // 2. Input validation — before any DB call
    const validated = ReferenceValuesListInputSchema.parse(input)

    // 3. Auth client — created after all guards pass
    const supabase = await createServerAuthClient()
    const repository = new ReferenceValuesSupabaseRepository(supabase)
    
    // 4. Execute operation — pass resolved context explicitly
    // @type-escape: generated action stub — list params unknown until semantic plan fills Zod input
    const result = await repository.list(validated as never)

    // 5. Log success
    await logServerEvent({
      actorId: userId,
      actorType: "user",
      component: "catalog.reference-values.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_reference-values_success",
      operation: "list",
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
      component: "catalog.reference-values.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_reference-values_failed",
      operation: "list",
      operationType: "action",
      outcome: "failure",
      error,
      metadata: sanitizeForAudit(input as Record<string, unknown>, AUDIT_SAFE_FIELDS),
      service: "supabase-data",
    })

    throw error
  }
}
