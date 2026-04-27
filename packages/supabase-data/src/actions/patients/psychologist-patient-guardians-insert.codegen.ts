/**
 * insertPsychologistPatientGuardiansAction
 *
 * @module @workspace/supabase-data/actions/patients/psychologist-patient-guardians-insert.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistPatientGuardiansDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-guardians.dto.codegen"
import { PsychologistPatientGuardiansSupabaseRepository } from "@workspace/supabase-data/modules/patients/infrastructure/repositories/psychologist-patient-guardians-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistPatientGuardiansInsertInputSchema = z.object({
  city: z.string().nullable().optional(),
  complement: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  cpf: z.string().nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  fullName: z.string().nullable().optional(),
  guardianType: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  neighborhood: z.string().nullable().optional(),
  number: z.string().nullable().optional(),
  patientId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
  phone: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  psychologistId: z.uuid({ error: "Invalid UUID" }),
  relationship: z.string().nullable().optional(),
  rg: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  street: z.string().nullable().optional(),
})

export type PsychologistPatientGuardiansInsertInput = z.infer<
  typeof PsychologistPatientGuardiansInsertInputSchema
>
export type PsychologistPatientGuardiansInsertOutput = PsychologistPatientGuardiansDTO

export async function insertPsychologistPatientGuardiansAction(
  input: PsychologistPatientGuardiansInsertInput
): Promise<PsychologistPatientGuardiansInsertOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "insert_psychologist-patient-guardians" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistPatientGuardiansInsertInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistPatientGuardiansSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<PsychologistPatientGuardiansDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as Partial<PsychologistPatientGuardiansDTO>
    const result = await repository.insert(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "patients.psychologist-patient-guardians.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_psychologist-patient-guardians_success",
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
      component: "patients.psychologist-patient-guardians.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_psychologist-patient-guardians_failed",
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
