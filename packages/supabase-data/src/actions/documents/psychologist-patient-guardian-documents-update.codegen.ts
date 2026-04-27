/**
 * updatePsychologistPatientGuardianDocumentsAction
 *
 * @module @workspace/supabase-data/actions/documents/psychologist-patient-guardian-documents-update.codegen
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

const PsychologistPatientGuardianDocumentsUpdateInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
  data: z
    .object({
      description: z.string().nullable().optional(),
      documentType: z.string().optional(),
      expiresAt: z.string().nullable().optional(),
      fileName: z.string().optional(),
      fileSize: z.number().nullable().optional(),
      fileUrl: z.string().nullable().optional(),
      guardianId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      mimeType: z.string().nullable().optional(),
      patientId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      psychologistId: z.uuid({ error: "Invalid UUID" }).optional(),
      status: z.string().optional(),
      title: z.string().optional(),
      uploadedAt: z.string().nullable().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
})

export type PsychologistPatientGuardianDocumentsUpdateInput = z.infer<
  typeof PsychologistPatientGuardianDocumentsUpdateInputSchema
>
export type PsychologistPatientGuardianDocumentsUpdateOutput =
  PsychologistPatientGuardianDocumentsDTO

export async function updatePsychologistPatientGuardianDocumentsAction(
  input: PsychologistPatientGuardianDocumentsUpdateInput
): Promise<PsychologistPatientGuardianDocumentsUpdateOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "update_psychologist-patient-guardian-documents" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistPatientGuardianDocumentsUpdateInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistPatientGuardianDocumentsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<PsychologistPatientGuardianDocumentsDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated.data).filter(([, value]) => value !== undefined)
    ) as Partial<PsychologistPatientGuardianDocumentsDTO>
    const result = await repository.update(validated.id, repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "documents.psychologist-patient-guardian-documents.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_psychologist-patient-guardian-documents_success",
      operation: "update",
      operationType: "action",
      outcome: "success",
      metadata: {
        // @type-escape: DTO id field type is unknown at codegen time — safe to narrow to primitive at logging boundary
        id: (result as { id?: string | number | boolean | null }).id ?? validated.id,
      },
      service: "supabase-data",
    })

    return result
  } catch (error) {
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "documents.psychologist-patient-guardian-documents.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_psychologist-patient-guardian-documents_failed",
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
