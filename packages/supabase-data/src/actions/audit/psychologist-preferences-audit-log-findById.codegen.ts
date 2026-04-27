/**
 * findByIdPsychologistPreferencesAuditLogAction
 *
 * @module @workspace/supabase-data/actions/audit/psychologist-preferences-audit-log-findById.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistPreferencesAuditLogDTO } from "@workspace/supabase-data/modules/audit/domain/dto/psychologist-preferences-audit-log.dto.codegen"
import { PsychologistPreferencesAuditLogSupabaseRepository } from "@workspace/supabase-data/modules/audit/infrastructure/repositories/psychologist-preferences-audit-log-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistPreferencesAuditLogFindByIdInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type PsychologistPreferencesAuditLogFindByIdInput = z.infer<
  typeof PsychologistPreferencesAuditLogFindByIdInputSchema
>
export type PsychologistPreferencesAuditLogFindByIdOutput =
  PsychologistPreferencesAuditLogDTO | null

export async function findByIdPsychologistPreferencesAuditLogAction(
  input: PsychologistPreferencesAuditLogFindByIdInput
): Promise<PsychologistPreferencesAuditLogFindByIdOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({
    action: "findById_psychologist-preferences-audit-log",
    requiredRole: "admin",
  })
  const actorIdForLog = userId

  try {
    const validated = PsychologistPreferencesAuditLogFindByIdInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistPreferencesAuditLogSupabaseRepository(supabase)
    const result = await repository.findById(validated.id)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "audit.psychologist-preferences-audit-log.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_psychologist-preferences-audit-log_success",
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
      component: "audit.psychologist-preferences-audit-log.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_psychologist-preferences-audit-log_failed",
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
