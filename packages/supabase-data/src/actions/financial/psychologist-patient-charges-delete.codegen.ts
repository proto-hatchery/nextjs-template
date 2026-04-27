/**
 * deletePsychologistPatientChargesAction
 *
 * @module @workspace/supabase-data/actions/financial/psychologist-patient-charges-delete.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { PsychologistPatientChargesSupabaseRepository } from "@workspace/supabase-data/modules/financial/infrastructure/repositories/psychologist-patient-charges-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistPatientChargesDeleteInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type PsychologistPatientChargesDeleteInput = z.infer<
  typeof PsychologistPatientChargesDeleteInputSchema
>
export type PsychologistPatientChargesDeleteOutput = { success: true }

export async function deletePsychologistPatientChargesAction(
  input: PsychologistPatientChargesDeleteInput
): Promise<PsychologistPatientChargesDeleteOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "delete_psychologist-patient-charges" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistPatientChargesDeleteInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistPatientChargesSupabaseRepository(supabase)
    await repository.delete(validated.id)
    const result = { success: true } as const

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "financial.psychologist-patient-charges.delete",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "delete_psychologist-patient-charges_success",
      operation: "delete",
      operationType: "action",
      outcome: "success",
      metadata: {
        id: validated.id,
      },
      service: "supabase-data",
    })

    return result
  } catch (error) {
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "financial.psychologist-patient-charges.delete",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "delete_psychologist-patient-charges_failed",
      operation: "delete",
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
