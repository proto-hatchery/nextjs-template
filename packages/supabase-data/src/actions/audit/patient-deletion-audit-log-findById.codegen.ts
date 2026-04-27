/**
 * findByIdPatientDeletionAuditLogAction
 *
 * @module @workspace/supabase-data/actions/audit/patient-deletion-audit-log-findById.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PatientDeletionAuditLogDTO } from "@workspace/supabase-data/modules/audit/domain/dto/patient-deletion-audit-log.dto.codegen"
import { PatientDeletionAuditLogSupabaseRepository } from "@workspace/supabase-data/modules/audit/infrastructure/repositories/patient-deletion-audit-log-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PatientDeletionAuditLogFindByIdInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type PatientDeletionAuditLogFindByIdInput = z.infer<
  typeof PatientDeletionAuditLogFindByIdInputSchema
>
export type PatientDeletionAuditLogFindByIdOutput = PatientDeletionAuditLogDTO | null

export async function findByIdPatientDeletionAuditLogAction(
  input: PatientDeletionAuditLogFindByIdInput
): Promise<PatientDeletionAuditLogFindByIdOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({
    action: "findById_patient-deletion-audit-log",
    requiredRole: "admin",
  })
  const actorIdForLog = userId

  try {
    const validated = PatientDeletionAuditLogFindByIdInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PatientDeletionAuditLogSupabaseRepository(supabase)
    const result = await repository.findById(validated.id)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "audit.patient-deletion-audit-log.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_patient-deletion-audit-log_success",
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
      component: "audit.patient-deletion-audit-log.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_patient-deletion-audit-log_failed",
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
