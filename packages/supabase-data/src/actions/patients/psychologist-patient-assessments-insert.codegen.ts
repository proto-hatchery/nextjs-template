/**
 * InsertPsychologistPatientAssessments Server Action
 * 
 * Handles insert operation for psychologist_patient_assessments.
 * 
 * ## Usage
 * 
 * Example:
 * ```typescript
 * import { insertPsychologistPatientAssessmentsAction } from "@workspace/supabase-data/actions/patients/psychologist-patient-assessments-insert.codegen"
 * 
 * const result = await insertPsychologistPatientAssessmentsAction(input)
 * ```
 * 
 * @module @workspace/supabase-data/actions/patients/psychologist-patient-assessments-insert
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { PsychologistPatientAssessmentsSupabaseRepository } from "@workspace/supabase-data/modules/patients/infrastructure/repositories/psychologist-patient-assessments-supabase.repository.codegen"
import { logServerEvent } from "@workspace/logging/server"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"

/**
 * Audit-safe fields for this table (HIPAA §164.312(b) compliant)
 * 
 * These fields are safe to log in error metadata without exposing PHI.
 */
const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

/**
 * Input schema for insertPsychologistPatientAssessmentsAction
 * 
 * Uses Zod v4 syntax (top-level APIs, not z.string().email() etc.)
 */
const PsychologistPatientAssessmentsInsertInputSchema = z.object({
  // TODO: Define input fields based on psychologist_patient_assessments.insert requirements
  // Example for insert (Zod v4 syntax):
  // email: z.email({ error: "Invalid email" }),
  // id: z.uuid({ error: "Invalid UUID" }),
  // url: z.url({ error: "Invalid URL" }),
  // datetime: z.iso.datetime({ error: "Invalid datetime" }),
  // metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Input type for insertPsychologistPatientAssessmentsAction
 */
export type PsychologistPatientAssessmentsInsertInput = z.infer<typeof PsychologistPatientAssessmentsInsertInputSchema>

/**
 * Output type for insertPsychologistPatientAssessmentsAction — unknown until the action is wired to real DTOs / port types.
 */
export type PsychologistPatientAssessmentsInsertOutput = unknown

/**
 * InsertPsychologistPatientAssessments Server Action
 * 
 * @param input - Action input
 */
export async function insertPsychologistPatientAssessmentsAction(
  input: PsychologistPatientAssessmentsInsertInput
): Promise<PsychologistPatientAssessmentsInsertOutput> {
  const startedAt = Date.now()
  let actorIdForLog = "unknown"

  try {
    // 1. Identity + rate limit (SSOT via requireAuth)
    const { userId } = await requireAuth({
      action: "insert_psychologist-patient-assessments",
    })
    actorIdForLog = userId
    // 2. Input validation — before any DB call
    const validated = PsychologistPatientAssessmentsInsertInputSchema.parse(input)

    // 3. Auth client — created after all guards pass
    const supabase = await createServerAuthClient()
    const repository = new PsychologistPatientAssessmentsSupabaseRepository(supabase)
    
    // 4. Execute operation — pass resolved context explicitly
    // @type-escape: generated action stub — insert payload unknown until TODO input schema
    const result = await repository.insert(validated as never)

    // 5. Log success
    await logServerEvent({
      actorId: userId,
      actorType: "user",
      component: "patients.psychologist-patient-assessments.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_psychologist-patient-assessments_success",
      operation: "insert",
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
      component: "patients.psychologist-patient-assessments.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_psychologist-patient-assessments_failed",
      operation: "insert",
      operationType: "action",
      outcome: "failure",
      error,
      metadata: sanitizeForAudit(input as Record<string, unknown>, AUDIT_SAFE_FIELDS),
      service: "supabase-data",
    })

    throw error
  }
}
