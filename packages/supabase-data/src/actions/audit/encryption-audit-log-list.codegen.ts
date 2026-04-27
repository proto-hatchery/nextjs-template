/**
 * listEncryptionAuditLogAction
 *
 * @module @workspace/supabase-data/actions/audit/encryption-audit-log-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { EncryptionAuditLogDTO } from "@workspace/supabase-data/modules/audit/domain/dto/encryption-audit-log.dto.codegen"
import type { EncryptionAuditLogListParams } from "@workspace/supabase-data/modules/audit/domain/ports/encryption-audit-log-repository.port.codegen"
import { EncryptionAuditLogSupabaseRepository } from "@workspace/supabase-data/modules/audit/infrastructure/repositories/encryption-audit-log-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const EncryptionAuditLogListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type EncryptionAuditLogListInput = z.infer<typeof EncryptionAuditLogListInputSchema>
export type EncryptionAuditLogListOutput = { rows: EncryptionAuditLogDTO[] }

export async function listEncryptionAuditLogAction(
  input: EncryptionAuditLogListInput
): Promise<EncryptionAuditLogListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({
    action: "list_encryption-audit-log",
    requiredRole: "admin",
  })
  const actorIdForLog = userId

  try {
    const validated = EncryptionAuditLogListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new EncryptionAuditLogSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies EncryptionAuditLogListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as EncryptionAuditLogListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "audit.encryption-audit-log.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_encryption-audit-log_success",
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
      component: "audit.encryption-audit-log.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_encryption-audit-log_failed",
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
