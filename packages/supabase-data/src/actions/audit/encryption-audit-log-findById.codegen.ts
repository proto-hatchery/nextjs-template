/**
 * findByIdEncryptionAuditLogAction
 *
 * @module @workspace/supabase-data/actions/audit/encryption-audit-log-findById.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { EncryptionAuditLogDTO } from "@workspace/supabase-data/modules/audit/domain/dto/encryption-audit-log.dto.codegen"
import { EncryptionAuditLogSupabaseRepository } from "@workspace/supabase-data/modules/audit/infrastructure/repositories/encryption-audit-log-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const EncryptionAuditLogFindByIdInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type EncryptionAuditLogFindByIdInput = z.infer<typeof EncryptionAuditLogFindByIdInputSchema>
export type EncryptionAuditLogFindByIdOutput = EncryptionAuditLogDTO | null

export async function findByIdEncryptionAuditLogAction(
  input: EncryptionAuditLogFindByIdInput
): Promise<EncryptionAuditLogFindByIdOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({
    action: "findById_encryption-audit-log",
    requiredRole: "admin",
  })
  const actorIdForLog = userId

  try {
    const validated = EncryptionAuditLogFindByIdInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new EncryptionAuditLogSupabaseRepository(supabase)
    const result = await repository.findById(validated.id)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "audit.encryption-audit-log.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_encryption-audit-log_success",
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
      component: "audit.encryption-audit-log.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_encryption-audit-log_failed",
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
