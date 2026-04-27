/**
 * listPsychologistPreferencesAuditLogAction
 *
 * @module @workspace/supabase-data/actions/audit/psychologist-preferences-audit-log-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistPreferencesAuditLogDTO } from "@workspace/supabase-data/modules/audit/domain/dto/psychologist-preferences-audit-log.dto.codegen"
import type { PsychologistPreferencesAuditLogListParams } from "@workspace/supabase-data/modules/audit/domain/ports/psychologist-preferences-audit-log-repository.port.codegen"
import { PsychologistPreferencesAuditLogSupabaseRepository } from "@workspace/supabase-data/modules/audit/infrastructure/repositories/psychologist-preferences-audit-log-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistPreferencesAuditLogListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type PsychologistPreferencesAuditLogListInput = z.infer<
  typeof PsychologistPreferencesAuditLogListInputSchema
>
export type PsychologistPreferencesAuditLogListOutput = {
  rows: PsychologistPreferencesAuditLogDTO[]
}

export async function listPsychologistPreferencesAuditLogAction(
  input: PsychologistPreferencesAuditLogListInput
): Promise<PsychologistPreferencesAuditLogListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({
    action: "list_psychologist-preferences-audit-log",
    requiredRole: "admin",
  })
  const actorIdForLog = userId

  try {
    const validated = PsychologistPreferencesAuditLogListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistPreferencesAuditLogSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies PsychologistPreferencesAuditLogListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as PsychologistPreferencesAuditLogListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "audit.psychologist-preferences-audit-log.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_psychologist-preferences-audit-log_success",
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
      component: "audit.psychologist-preferences-audit-log.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_psychologist-preferences-audit-log_failed",
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
