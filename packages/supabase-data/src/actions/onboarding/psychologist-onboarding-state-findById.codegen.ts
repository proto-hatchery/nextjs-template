/**
 * findByIdPsychologistOnboardingStateAction
 *
 * @module @workspace/supabase-data/actions/onboarding/psychologist-onboarding-state-findById.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistOnboardingStateDTO } from "@workspace/supabase-data/modules/onboarding/domain/dto/psychologist-onboarding-state.dto.codegen"
import { PsychologistOnboardingStateSupabaseRepository } from "@workspace/supabase-data/modules/onboarding/infrastructure/repositories/psychologist-onboarding-state-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistOnboardingStateFindByIdInputSchema = z.object({
  psychologistId: z.uuid({ error: "Invalid UUID" }),
})

export type PsychologistOnboardingStateFindByIdInput = z.infer<
  typeof PsychologistOnboardingStateFindByIdInputSchema
>
export type PsychologistOnboardingStateFindByIdOutput = PsychologistOnboardingStateDTO | null

export async function findByIdPsychologistOnboardingStateAction(
  input: PsychologistOnboardingStateFindByIdInput
): Promise<PsychologistOnboardingStateFindByIdOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "findById_psychologist-onboarding-state" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistOnboardingStateFindByIdInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistOnboardingStateSupabaseRepository(supabase)
    const result = await repository.findById(validated.psychologistId)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "onboarding.psychologist-onboarding-state.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_psychologist-onboarding-state_success",
      operation: "findById",
      operationType: "action",
      outcome: "success",
      metadata: {
        id: validated.psychologistId,
      },
      service: "supabase-data",
    })

    return result
  } catch (error) {
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "onboarding.psychologist-onboarding-state.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_psychologist-onboarding-state_failed",
      operation: "findById",
      operationType: "action",
      outcome: "failure",
      error,
      // @type-escape: input type is the generated Zod-inferred shape; Record<string,unknown> is required by sanitizeForAudit — diverges at the catch boundary where input may be unvalidated
      metadata: sanitizeForAudit(input as Record<string, unknown>, AUDIT_SAFE_FIELDS),
      service: "supabase-data",
    })

    throw error
  }
}
