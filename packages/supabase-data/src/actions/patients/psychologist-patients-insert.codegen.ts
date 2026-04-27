/**
 * insertPsychologistPatientsAction
 *
 * @module @workspace/supabase-data/actions/patients/psychologist-patients-insert.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistPatientsDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patients.dto.codegen"
import { PsychologistPatientsSupabaseRepository } from "@workspace/supabase-data/modules/patients/infrastructure/repositories/psychologist-patients-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistPatientsInsertInputSchema = z.object({
  archivedAt: z.string().nullable().optional(),
  archivedBy: z.string().nullable().optional(),
  attachedDocuments: z.union([z.string(), z.number(), z.boolean(), z.null()]).nullable().optional(),
  clinicalHypothesis: z.string().nullable().optional(),
  clinicalNotes: z.string().nullable().optional(),
  createdBy: z.string().nullable().optional(),
  currentMedications: z
    .union([z.string(), z.number(), z.boolean(), z.null()])
    .nullable()
    .optional(),
  dataSharingConsent: z.boolean().nullable().optional(),
  dataSharingConsentDate: z.string().nullable().optional(),
  defaultSessionPrice: z.number().nullable().optional(),
  deletedBy: z.string().nullable().optional(),
  dischargeReason: z.string().nullable().optional(),
  disorders: z.union([z.string(), z.number(), z.boolean(), z.null()]).nullable().optional(),
  firstSessionDate: z.string().nullable().optional(),
  informedConsentDate: z.string().nullable().optional(),
  informedConsentDocumentUrl: z.string().nullable().optional(),
  informedConsentSigned: z.boolean().nullable().optional(),
  initialComplaint: z.string().nullable().optional(),
  inviteExpiresAt: z.string().nullable().optional(),
  inviteReminderCount: z.number().nullable().optional(),
  inviteReminderSentAt: z.string().nullable().optional(),
  inviteSentVia: z.union([z.string(), z.number(), z.boolean(), z.null()]).nullable().optional(),
  inviteStatus: z.union([z.string(), z.number(), z.boolean(), z.null()]).nullable().optional(),
  inviteToken: z.string().nullable().optional(),
  invitedAt: z.string().nullable().optional(),
  isMinor: z.boolean().nullable().optional(),
  knownAllergies: z.union([z.string(), z.number(), z.boolean(), z.null()]).nullable().optional(),
  lastSessionDate: z.string().nullable().optional(),
  manualAddress: z.union([z.string(), z.number(), z.boolean(), z.null()]).nullable().optional(),
  manualCpf: z.string().nullable().optional(),
  manualDateOfBirth: z.string().nullable().optional(),
  manualDisplayName: z.string().nullable().optional(),
  manualEmail: z.string().nullable().optional(),
  manualEmergencyContacts: z
    .union([z.string(), z.number(), z.boolean(), z.null()])
    .nullable()
    .optional(),
  manualFirstName: z.string().nullable().optional(),
  manualFullName: z.string().nullable().optional(),
  manualGender: z.string().nullable().optional(),
  manualLastName: z.string().nullable().optional(),
  manualPatientOrigin: z.string().nullable().optional(),
  manualPhone: z.string().nullable().optional(),
  manualPlaceOfBirth: z.string().nullable().optional(),
  manualPreferredName: z.string().nullable().optional(),
  manualProfession: z.string().nullable().optional(),
  manualPronouns: z.string().nullable().optional(),
  manualRg: z.string().nullable().optional(),
  patientId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
  preferredContactMethod: z
    .union([z.string(), z.number(), z.boolean(), z.null()])
    .nullable()
    .optional(),
  priceSetAt: z.string().nullable().optional(),
  priceSetBy: z.string().nullable().optional(),
  psychologistId: z.uuid({ error: "Invalid UUID" }),
  recoveryDeadline: z.string().nullable().optional(),
  relationshipEndDate: z.string().nullable().optional(),
  relationshipStartDate: z.string().nullable().optional(),
  requiresLegalGuardian: z.boolean().nullable().optional(),
  retentionUntil: z.string().nullable().optional(),
  riskLevel: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  suicideRiskAssessment: z.string().nullable().optional(),
  syncedAddress: z.union([z.string(), z.number(), z.boolean(), z.null()]).nullable().optional(),
  syncedCpf: z.string().nullable().optional(),
  syncedDateOfBirth: z.string().nullable().optional(),
  syncedDisplayName: z.string().nullable().optional(),
  syncedEmail: z.string().nullable().optional(),
  syncedFullName: z.string().nullable().optional(),
  syncedGender: z.string().nullable().optional(),
  syncedPhone: z.string().nullable().optional(),
  syncedPlaceOfBirth: z.string().nullable().optional(),
  syncedProfession: z.string().nullable().optional(),
  syncedPronouns: z.string().nullable().optional(),
  syncedRg: z.string().nullable().optional(),
  therapeuticGoals: z.union([z.string(), z.number(), z.boolean(), z.null()]).nullable().optional(),
  totalSessionsCount: z.number().nullable().optional(),
  treatmentPlan: z.string().nullable().optional(),
  updatedBy: z.string().nullable().optional(),
})

export type PsychologistPatientsInsertInput = z.infer<typeof PsychologistPatientsInsertInputSchema>
export type PsychologistPatientsInsertOutput = PsychologistPatientsDTO

export async function insertPsychologistPatientsAction(
  input: PsychologistPatientsInsertInput
): Promise<PsychologistPatientsInsertOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "insert_psychologist-patients" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistPatientsInsertInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistPatientsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<PsychologistPatientsDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as Partial<PsychologistPatientsDTO>
    const result = await repository.insert(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "patients.psychologist-patients.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_psychologist-patients_success",
      operation: "insert",
      operationType: "action",
      outcome: "success",
      metadata: {
        // @type-escape: DTO id field type is unknown at codegen time — safe to narrow to primitive at logging boundary
        id: (result as { id?: string | number | boolean | null }).id ?? null,
      },
      service: "supabase-data",
    })

    return result
  } catch (error) {
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "patients.psychologist-patients.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_psychologist-patients_failed",
      operation: "insert",
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
