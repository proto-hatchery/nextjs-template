/**
 * UpdatePsychologistOnboardingState Server Action
 * 
 * Handles update operation for psychologist_onboarding_state.
 * 
 * ## Usage
 * 
 * Example:
 * ```typescript
 * import { updatePsychologistOnboardingStateAction } from "@workspace/supabase-data/actions/onboarding/psychologist-onboarding-state-update.codegen"
 * 
 * const result = await updatePsychologistOnboardingStateAction(input)
 * ```
 * 
 * @module @workspace/supabase-data/actions/onboarding/psychologist-onboarding-state-update
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { PsychologistOnboardingStateSupabaseRepository } from "@workspace/supabase-data/modules/onboarding/infrastructure/repositories/psychologist-onboarding-state-supabase.repository.codegen"
import { logServerEvent } from "@workspace/logging/server"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"

/**
 * Audit-safe fields for this table (HIPAA §164.312(b) compliant)
 * 
 * These fields are safe to log in error metadata without exposing PHI.
 */
const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

/**
 * Input schema for updatePsychologistOnboardingStateAction
 * 
 * Uses Zod v4 syntax (top-level APIs, not z.string().email() etc.)
 */
const PsychologistOnboardingStateUpdateInputSchema = z.object({
  // TODO: Define input fields based on psychologist_onboarding_state.update requirements
  // Example for insert (Zod v4 syntax):
  // email: z.email({ error: "Invalid email" }),
  // id: z.uuid({ error: "Invalid UUID" }),
  // url: z.url({ error: "Invalid URL" }),
  // datetime: z.iso.datetime({ error: "Invalid datetime" }),
  // metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Input type for updatePsychologistOnboardingStateAction
 */
export type PsychologistOnboardingStateUpdateInput = z.infer<typeof PsychologistOnboardingStateUpdateInputSchema>

/**
 * Output type for updatePsychologistOnboardingStateAction — unknown until the action is wired to real DTOs / port types.
 */
export type PsychologistOnboardingStateUpdateOutput = unknown

/**
 * UpdatePsychologistOnboardingState Server Action
 * 
 * @param input - Action input
 */
export async function updatePsychologistOnboardingStateAction(
  input: PsychologistOnboardingStateUpdateInput
): Promise<PsychologistOnboardingStateUpdateOutput> {
  const startedAt = Date.now()
  let actorIdForLog = "unknown"

  try {
    // 1. Identity + rate limit (SSOT via requireAuth)
    const { userId } = await requireAuth({
      action: "update_psychologist-onboarding-state",
    })
    actorIdForLog = userId
    // 2. Input validation — before any DB call
    const validated = PsychologistOnboardingStateUpdateInputSchema.parse(input)

    // 3. Auth client — created after all guards pass
    const supabase = await createServerAuthClient()
    const repository = new PsychologistOnboardingStateSupabaseRepository(supabase)
    
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
      component: "onboarding.psychologist-onboarding-state.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_psychologist-onboarding-state_success",
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
      component: "onboarding.psychologist-onboarding-state.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_psychologist-onboarding-state_failed",
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
