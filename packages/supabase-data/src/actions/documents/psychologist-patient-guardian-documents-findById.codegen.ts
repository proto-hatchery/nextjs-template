/**
 * findByIdPsychologistPatientGuardianDocumentsAction
 *
 * @module @workspace/supabase-data/actions/documents/psychologist-patient-guardian-documents-findById.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistPatientGuardianDocumentsDTO } from "@workspace/supabase-data/modules/documents/domain/dto/psychologist-patient-guardian-documents.dto.codegen"
import { PsychologistPatientGuardianDocumentsSupabaseRepository } from "@workspace/supabase-data/modules/documents/infrastructure/repositories/psychologist-patient-guardian-documents-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistPatientGuardianDocumentsFindByIdInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type PsychologistPatientGuardianDocumentsFindByIdInput = z.infer<
  typeof PsychologistPatientGuardianDocumentsFindByIdInputSchema
>
export type PsychologistPatientGuardianDocumentsFindByIdOutput =
  PsychologistPatientGuardianDocumentsDTO | null

export async function findByIdPsychologistPatientGuardianDocumentsAction(
  input: PsychologistPatientGuardianDocumentsFindByIdInput
): Promise<PsychologistPatientGuardianDocumentsFindByIdOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({
    action: "findById_psychologist-patient-guardian-documents",
  })
  const actorIdForLog = userId

  try {
    const validated = PsychologistPatientGuardianDocumentsFindByIdInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistPatientGuardianDocumentsSupabaseRepository(supabase)
    const result = await repository.findById(validated.id)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "documents.psychologist-patient-guardian-documents.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_psychologist-patient-guardian-documents_success",
      operation: "findById",
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
      component: "documents.psychologist-patient-guardian-documents.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_psychologist-patient-guardian-documents_failed",
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
