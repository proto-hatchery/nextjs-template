/**
 * deletePsychologistPatientGuardianDocumentsAction
 *
 * @module @workspace/supabase-data/actions/documents/psychologist-patient-guardian-documents-delete.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { PsychologistPatientGuardianDocumentsSupabaseRepository } from "@workspace/supabase-data/modules/documents/infrastructure/repositories/psychologist-patient-guardian-documents-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistPatientGuardianDocumentsDeleteInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type PsychologistPatientGuardianDocumentsDeleteInput = z.infer<
  typeof PsychologistPatientGuardianDocumentsDeleteInputSchema
>
export type PsychologistPatientGuardianDocumentsDeleteOutput = { success: true }

export async function deletePsychologistPatientGuardianDocumentsAction(
  input: PsychologistPatientGuardianDocumentsDeleteInput
): Promise<PsychologistPatientGuardianDocumentsDeleteOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "delete_psychologist-patient-guardian-documents" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistPatientGuardianDocumentsDeleteInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistPatientGuardianDocumentsSupabaseRepository(supabase)
    await repository.delete(validated.id)
    const result = { success: true } as const

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "documents.psychologist-patient-guardian-documents.delete",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "delete_psychologist-patient-guardian-documents_success",
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
      component: "documents.psychologist-patient-guardian-documents.delete",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "delete_psychologist-patient-guardian-documents_failed",
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
