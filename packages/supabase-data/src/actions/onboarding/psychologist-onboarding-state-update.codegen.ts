/**
 * updatePsychologistOnboardingStateAction
 *
 * @module @workspace/supabase-data/actions/onboarding/psychologist-onboarding-state-update.codegen
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

const PsychologistOnboardingStateUpdateInputSchema = z.object({
  psychologistId: z.uuid({ error: "Invalid UUID" }),
  data: z
    .object({
      abandonedAt: z.string().nullable().optional(),
      completionPercentage: z.number().nullable().optional(),
      configurationStepCompleted: z.boolean().nullable().optional(),
      currentStep: z.number().nullable().optional(),
      draftData: z.union([z.string(), z.number(), z.boolean(), z.null()]).nullable().optional(),
      identityStepCompleted: z.boolean().nullable().optional(),
      lastResumedAt: z.string().nullable().optional(),
      onboardingCompletedAt: z.string().nullable().optional(),
      operationalStepCompleted: z.boolean().nullable().optional(),
      paymentStepCompleted: z.boolean().nullable().optional(),
      professionalStepCompleted: z.boolean().nullable().optional(),
      profileStepCompleted: z.boolean().nullable().optional(),
      totalSteps: z.number().nullable().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
})

export type PsychologistOnboardingStateUpdateInput = z.infer<
  typeof PsychologistOnboardingStateUpdateInputSchema
>
export type PsychologistOnboardingStateUpdateOutput = PsychologistOnboardingStateDTO

export async function updatePsychologistOnboardingStateAction(
  input: PsychologistOnboardingStateUpdateInput
): Promise<PsychologistOnboardingStateUpdateOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "update_psychologist-onboarding-state" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistOnboardingStateUpdateInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistOnboardingStateSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<PsychologistOnboardingStateDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated.data).filter(([, value]) => value !== undefined)
    ) as Partial<PsychologistOnboardingStateDTO>
    const result = await repository.update(validated.psychologistId, repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "onboarding.psychologist-onboarding-state.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_psychologist-onboarding-state_success",
      operation: "update",
      operationType: "action",
      outcome: "success",
      metadata: {
        // @type-escape: DTO id field type is unknown at codegen time — safe to narrow to primitive at logging boundary
        id: (result as { id?: string | number | boolean | null }).id ?? validated.psychologistId,
      },
      service: "supabase-data",
    })

    return result
  } catch (error) {
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
      // @type-escape: input type is the generated Zod-inferred shape; Record<string,unknown> is required by sanitizeForAudit — diverges at the catch boundary where input may be unvalidated
      metadata: sanitizeForAudit(input as Record<string, unknown>, AUDIT_SAFE_FIELDS),
      service: "supabase-data",
    })

    throw error
  }
}
