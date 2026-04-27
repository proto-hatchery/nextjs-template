/**
 * listPsychologistOnboardingStateAction
 *
 * @module @workspace/supabase-data/actions/onboarding/psychologist-onboarding-state-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistOnboardingStateDTO } from "@workspace/supabase-data/modules/onboarding/domain/dto/psychologist-onboarding-state.dto.codegen"
import type { PsychologistOnboardingStateListParams } from "@workspace/supabase-data/modules/onboarding/domain/ports/psychologist-onboarding-state-repository.port.codegen"
import { PsychologistOnboardingStateSupabaseRepository } from "@workspace/supabase-data/modules/onboarding/infrastructure/repositories/psychologist-onboarding-state-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistOnboardingStateListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type PsychologistOnboardingStateListInput = z.infer<
  typeof PsychologistOnboardingStateListInputSchema
>
export type PsychologistOnboardingStateListOutput = { rows: PsychologistOnboardingStateDTO[] }

export async function listPsychologistOnboardingStateAction(
  input: PsychologistOnboardingStateListInput
): Promise<PsychologistOnboardingStateListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_psychologist-onboarding-state" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistOnboardingStateListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistOnboardingStateSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies PsychologistOnboardingStateListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as PsychologistOnboardingStateListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "onboarding.psychologist-onboarding-state.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_psychologist-onboarding-state_success",
      operation: "list",
      operationType: "action",
      outcome: "success",
      metadata: {
        rowCount: result.rows.length,
      },
      service: "supabase-data",
    })

    return result
  } catch (error) {
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "onboarding.psychologist-onboarding-state.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_psychologist-onboarding-state_failed",
      operation: "list",
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
