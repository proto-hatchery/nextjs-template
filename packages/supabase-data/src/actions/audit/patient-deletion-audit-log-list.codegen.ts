/**
 * listPatientDeletionAuditLogAction
 *
 * @module @workspace/supabase-data/actions/audit/patient-deletion-audit-log-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PatientDeletionAuditLogDTO } from "@workspace/supabase-data/modules/audit/domain/dto/patient-deletion-audit-log.dto.codegen"
import type { PatientDeletionAuditLogListParams } from "@workspace/supabase-data/modules/audit/domain/ports/patient-deletion-audit-log-repository.port.codegen"
import { PatientDeletionAuditLogSupabaseRepository } from "@workspace/supabase-data/modules/audit/infrastructure/repositories/patient-deletion-audit-log-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PatientDeletionAuditLogListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type PatientDeletionAuditLogListInput = z.infer<
  typeof PatientDeletionAuditLogListInputSchema
>
export type PatientDeletionAuditLogListOutput = { rows: PatientDeletionAuditLogDTO[] }

export async function listPatientDeletionAuditLogAction(
  input: PatientDeletionAuditLogListInput
): Promise<PatientDeletionAuditLogListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({
    action: "list_patient-deletion-audit-log",
    requiredRole: "admin",
  })
  const actorIdForLog = userId

  try {
    const validated = PatientDeletionAuditLogListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PatientDeletionAuditLogSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies PatientDeletionAuditLogListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as PatientDeletionAuditLogListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "audit.patient-deletion-audit-log.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_patient-deletion-audit-log_success",
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
      component: "audit.patient-deletion-audit-log.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_patient-deletion-audit-log_failed",
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
