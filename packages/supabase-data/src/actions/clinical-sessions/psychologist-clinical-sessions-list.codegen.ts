/**
 * listPsychologistClinicalSessionsAction
 *
 * @module @workspace/supabase-data/actions/clinical-sessions/psychologist-clinical-sessions-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistClinicalSessionsDTO } from "@workspace/supabase-data/modules/clinical-sessions/domain/dto/psychologist-clinical-sessions.dto.codegen"
import type { PsychologistClinicalSessionsListParams } from "@workspace/supabase-data/modules/clinical-sessions/domain/ports/psychologist-clinical-sessions-repository.port.codegen"
import { PsychologistClinicalSessionsSupabaseRepository } from "@workspace/supabase-data/modules/clinical-sessions/infrastructure/repositories/psychologist-clinical-sessions-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistClinicalSessionsListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type PsychologistClinicalSessionsListInput = z.infer<
  typeof PsychologistClinicalSessionsListInputSchema
>
export type PsychologistClinicalSessionsListOutput = { rows: PsychologistClinicalSessionsDTO[] }

export async function listPsychologistClinicalSessionsAction(
  input: PsychologistClinicalSessionsListInput
): Promise<PsychologistClinicalSessionsListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_psychologist-clinical-sessions" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistClinicalSessionsListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistClinicalSessionsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies PsychologistClinicalSessionsListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as PsychologistClinicalSessionsListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "clinical-sessions.psychologist-clinical-sessions.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_psychologist-clinical-sessions_success",
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
      component: "clinical-sessions.psychologist-clinical-sessions.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_psychologist-clinical-sessions_failed",
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
