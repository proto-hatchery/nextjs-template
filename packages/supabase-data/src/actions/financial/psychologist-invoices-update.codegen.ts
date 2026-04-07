/**
 * UpdatePsychologistInvoices Server Action
 * 
 * Handles update operation for psychologist_invoices.
 * 
 * ## Usage
 * 
 * Example:
 * ```typescript
 * import { updatePsychologistInvoicesAction } from "@workspace/supabase-data/actions/financial/psychologist-invoices-update.codegen"
 * 
 * const result = await updatePsychologistInvoicesAction(input)
 * ```
 * 
 * @module @workspace/supabase-data/actions/financial/psychologist-invoices-update
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { PsychologistInvoicesSupabaseRepository } from "@workspace/supabase-data/modules/financial/infrastructure/repositories/psychologist-invoices-supabase.repository.codegen"
import { logServerEvent } from "@workspace/logging/server"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"

/**
 * Audit-safe fields for this table (HIPAA §164.312(b) compliant)
 * 
 * These fields are safe to log in error metadata without exposing PHI.
 */
const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

/**
 * Input schema for updatePsychologistInvoicesAction
 * 
 * Uses Zod v4 syntax (top-level APIs, not z.string().email() etc.)
 */
const PsychologistInvoicesUpdateInputSchema = z.object({
  // TODO: Define input fields based on psychologist_invoices.update requirements
  // Example for insert (Zod v4 syntax):
  // email: z.email({ error: "Invalid email" }),
  // id: z.uuid({ error: "Invalid UUID" }),
  // url: z.url({ error: "Invalid URL" }),
  // datetime: z.iso.datetime({ error: "Invalid datetime" }),
  // metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Input type for updatePsychologistInvoicesAction
 */
export type PsychologistInvoicesUpdateInput = z.infer<typeof PsychologistInvoicesUpdateInputSchema>

/**
 * Output type for updatePsychologistInvoicesAction — unknown until the action is wired to real DTOs / port types.
 */
export type PsychologistInvoicesUpdateOutput = unknown

/**
 * UpdatePsychologistInvoices Server Action
 * 
 * @param input - Action input
 */
export async function updatePsychologistInvoicesAction(
  input: PsychologistInvoicesUpdateInput
): Promise<PsychologistInvoicesUpdateOutput> {
  const startedAt = Date.now()
  let actorIdForLog = "unknown"

  try {
    // 1. Identity + rate limit (SSOT via requireAuth)
    const { userId } = await requireAuth({
      action: "update_psychologist-invoices",
    })
    actorIdForLog = userId
    // 2. Input validation — before any DB call
    const validated = PsychologistInvoicesUpdateInputSchema.parse(input)

    // 3. Auth client — created after all guards pass
    const supabase = await createServerAuthClient()
    const repository = new PsychologistInvoicesSupabaseRepository(supabase)
    
    // 4. Execute operation — pass resolved context explicitly
    // @type-escape: generated action stub — id shape from validated after TODO input schema
    const validatedId = (validated as unknown as { id: string }).id
    // @type-escape: generated action stub — update patch unknown until TODO input schema
    const validatedPatch = validated as never
    const result = await repository.update(validatedId, validatedPatch)

    // 5. Log success
    await logServerEvent({
      actorId: userId,
      actorType: "user",
      component: "financial.psychologist-invoices.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_psychologist-invoices_success",
      operation: "update",
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
      component: "financial.psychologist-invoices.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_psychologist-invoices_failed",
      operation: "update",
      operationType: "action",
      outcome: "failure",
      error,
      metadata: sanitizeForAudit(input as Record<string, unknown>, AUDIT_SAFE_FIELDS),
      service: "supabase-data",
    })

    throw error
  }
}
