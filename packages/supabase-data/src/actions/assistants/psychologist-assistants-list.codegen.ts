/**
 * ListPsychologistAssistants Server Action
 * 
 * Handles list operation for psychologist_assistants.
 * 
 * ## Usage
 * 
 * Example:
 * ```typescript
 * import { listPsychologistAssistantsAction } from "@workspace/supabase-data/actions/assistants/psychologist-assistants-list.codegen"
 * 
 * const result = await listPsychologistAssistantsAction(input)
 * ```
 * 
 * @module @workspace/supabase-data/actions/assistants/psychologist-assistants-list
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { PsychologistAssistantsSupabaseRepository } from "@workspace/supabase-data/modules/assistants/infrastructure/repositories/psychologist-assistants-supabase.repository.codegen"
import { logServerEvent } from "@workspace/logging/server"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"

/**
 * Audit-safe fields for this table (HIPAA §164.312(b) compliant)
 * 
 * These fields are safe to log in error metadata without exposing PHI.
 */
const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

/**
 * Input schema for listPsychologistAssistantsAction
 * 
 * Uses Zod v4 syntax (top-level APIs, not z.string().email() etc.)
 */
const PsychologistAssistantsListInputSchema = z.object({
  // TODO: Define input fields based on psychologist_assistants.list requirements
  // Example for insert (Zod v4 syntax):
  // email: z.email({ error: "Invalid email" }),
  // id: z.uuid({ error: "Invalid UUID" }),
  // url: z.url({ error: "Invalid URL" }),
  // datetime: z.iso.datetime({ error: "Invalid datetime" }),
  // metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Input type for listPsychologistAssistantsAction
 */
export type PsychologistAssistantsListInput = z.infer<typeof PsychologistAssistantsListInputSchema>

/**
 * Output type for listPsychologistAssistantsAction — unknown until the action is wired to real DTOs / port types.
 */
export type PsychologistAssistantsListOutput = unknown

/**
 * ListPsychologistAssistants Server Action
 * 
 * @param input - Action input
 */
export async function listPsychologistAssistantsAction(
  input: PsychologistAssistantsListInput
): Promise<PsychologistAssistantsListOutput> {
  const startedAt = Date.now()
  let actorIdForLog = "unknown"

  try {
    // 1. Identity + rate limit (SSOT via requireAuth)
    const { userId } = await requireAuth({
      action: "list_psychologist-assistants",
    })
    actorIdForLog = userId
    // 2. Input validation — before any DB call
    const validated = PsychologistAssistantsListInputSchema.parse(input)

    // 3. Auth client — created after all guards pass
    const supabase = await createServerAuthClient()
    const repository = new PsychologistAssistantsSupabaseRepository(supabase)
    
    // 4. Execute operation — pass resolved context explicitly
    // @type-escape: generated action stub — list params unknown until semantic plan fills Zod input
    const result = await repository.list(validated as never)

    // 5. Log success
    await logServerEvent({
      actorId: userId,
      actorType: "user",
      component: "assistants.psychologist-assistants.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_psychologist-assistants_success",
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
      component: "assistants.psychologist-assistants.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_psychologist-assistants_failed",
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
