/**
 * findByIdAuditLogsAction
 *
 * @module @workspace/supabase-data/actions/audit/audit-logs-findById.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { AuditLogsDTO } from "@workspace/supabase-data/modules/audit/domain/dto/audit-logs.dto.codegen"
import { AuditLogsSupabaseRepository } from "@workspace/supabase-data/modules/audit/infrastructure/repositories/audit-logs-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const AuditLogsFindByIdInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type AuditLogsFindByIdInput = z.infer<typeof AuditLogsFindByIdInputSchema>
export type AuditLogsFindByIdOutput = AuditLogsDTO | null

export async function findByIdAuditLogsAction(
  input: AuditLogsFindByIdInput
): Promise<AuditLogsFindByIdOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "findById_audit-logs", requiredRole: "admin" })
  const actorIdForLog = userId

  try {
    const validated = AuditLogsFindByIdInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new AuditLogsSupabaseRepository(supabase)
    const result = await repository.findById(validated.id)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "audit.audit-logs.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_audit-logs_success",
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
      component: "audit.audit-logs.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_audit-logs_failed",
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
