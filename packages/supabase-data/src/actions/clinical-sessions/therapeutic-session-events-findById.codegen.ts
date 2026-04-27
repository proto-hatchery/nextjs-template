/**
 * findByIdTherapeuticSessionEventsAction
 *
 * @module @workspace/supabase-data/actions/clinical-sessions/therapeutic-session-events-findById.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { TherapeuticSessionEventsDTO } from "@workspace/supabase-data/modules/clinical-sessions/domain/dto/therapeutic-session-events.dto.codegen"
import { TherapeuticSessionEventsSupabaseRepository } from "@workspace/supabase-data/modules/clinical-sessions/infrastructure/repositories/therapeutic-session-events-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const TherapeuticSessionEventsFindByIdInputSchema = z.object({
  calendarEventId: z.uuid({ error: "Invalid UUID" }),
})

export type TherapeuticSessionEventsFindByIdInput = z.infer<
  typeof TherapeuticSessionEventsFindByIdInputSchema
>
export type TherapeuticSessionEventsFindByIdOutput = TherapeuticSessionEventsDTO | null

export async function findByIdTherapeuticSessionEventsAction(
  input: TherapeuticSessionEventsFindByIdInput
): Promise<TherapeuticSessionEventsFindByIdOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "findById_therapeutic-session-events" })
  const actorIdForLog = userId

  try {
    const validated = TherapeuticSessionEventsFindByIdInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new TherapeuticSessionEventsSupabaseRepository(supabase)
    const result = await repository.findById(validated.calendarEventId)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "clinical-sessions.therapeutic-session-events.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_therapeutic-session-events_success",
      operation: "findById",
      operationType: "action",
      outcome: "success",
      metadata: {
        id: validated.calendarEventId,
      },
      service: "supabase-data",
    })

    return result
  } catch (error) {
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "clinical-sessions.therapeutic-session-events.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_therapeutic-session-events_failed",
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
