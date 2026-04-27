/**
 * findByIdCalendarEventsAction
 *
 * @module @workspace/supabase-data/actions/calendar/calendar-events-findById.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { CalendarEventsDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-events.dto.codegen"
import { CalendarEventsSupabaseRepository } from "@workspace/supabase-data/modules/calendar/infrastructure/repositories/calendar-events-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const CalendarEventsFindByIdInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type CalendarEventsFindByIdInput = z.infer<typeof CalendarEventsFindByIdInputSchema>
export type CalendarEventsFindByIdOutput = CalendarEventsDTO | null

export async function findByIdCalendarEventsAction(
  input: CalendarEventsFindByIdInput
): Promise<CalendarEventsFindByIdOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "findById_calendar-events" })
  const actorIdForLog = userId

  try {
    const validated = CalendarEventsFindByIdInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new CalendarEventsSupabaseRepository(supabase)
    const result = await repository.findById(validated.id)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "calendar.calendar-events.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_calendar-events_success",
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
      component: "calendar.calendar-events.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_calendar-events_failed",
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
