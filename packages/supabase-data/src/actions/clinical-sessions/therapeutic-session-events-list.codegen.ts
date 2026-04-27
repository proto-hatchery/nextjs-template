/**
 * listTherapeuticSessionEventsAction
 *
 * @module @workspace/supabase-data/actions/clinical-sessions/therapeutic-session-events-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { TherapeuticSessionEventsDTO } from "@workspace/supabase-data/modules/clinical-sessions/domain/dto/therapeutic-session-events.dto.codegen"
import type { TherapeuticSessionEventsListParams } from "@workspace/supabase-data/modules/clinical-sessions/domain/ports/therapeutic-session-events-repository.port.codegen"
import { TherapeuticSessionEventsSupabaseRepository } from "@workspace/supabase-data/modules/clinical-sessions/infrastructure/repositories/therapeutic-session-events-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const TherapeuticSessionEventsListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type TherapeuticSessionEventsListInput = z.infer<
  typeof TherapeuticSessionEventsListInputSchema
>
export type TherapeuticSessionEventsListOutput = { rows: TherapeuticSessionEventsDTO[] }

export async function listTherapeuticSessionEventsAction(
  input: TherapeuticSessionEventsListInput
): Promise<TherapeuticSessionEventsListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_therapeutic-session-events" })
  const actorIdForLog = userId

  try {
    const validated = TherapeuticSessionEventsListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new TherapeuticSessionEventsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies TherapeuticSessionEventsListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as TherapeuticSessionEventsListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "clinical-sessions.therapeutic-session-events.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_therapeutic-session-events_success",
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
      component: "clinical-sessions.therapeutic-session-events.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_therapeutic-session-events_failed",
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
