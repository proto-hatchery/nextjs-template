/**
 * listAuditLogsAction
 *
 * @module @workspace/supabase-data/actions/audit/audit-logs-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { AuditLogsDTO } from "@workspace/supabase-data/modules/audit/domain/dto/audit-logs.dto.codegen"
import type { AuditLogsListParams } from "@workspace/supabase-data/modules/audit/domain/ports/audit-logs-repository.port.codegen"
import { AuditLogsSupabaseRepository } from "@workspace/supabase-data/modules/audit/infrastructure/repositories/audit-logs-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const AuditLogsListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type AuditLogsListInput = z.infer<typeof AuditLogsListInputSchema>
export type AuditLogsListOutput = { rows: AuditLogsDTO[] }

export async function listAuditLogsAction(input: AuditLogsListInput): Promise<AuditLogsListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_audit-logs", requiredRole: "admin" })
  const actorIdForLog = userId

  try {
    const validated = AuditLogsListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new AuditLogsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies AuditLogsListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as AuditLogsListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "audit.audit-logs.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_audit-logs_success",
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
      component: "audit.audit-logs.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_audit-logs_failed",
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
