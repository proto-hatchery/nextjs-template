/**
 * findByIdCalendarEventSeriesExceptionsAction
 *
 * @module @workspace/supabase-data/actions/calendar/calendar-event-series-exceptions-findById.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { CalendarEventSeriesExceptionsDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-event-series-exceptions.dto.codegen"
import { CalendarEventSeriesExceptionsSupabaseRepository } from "@workspace/supabase-data/modules/calendar/infrastructure/repositories/calendar-event-series-exceptions-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const CalendarEventSeriesExceptionsFindByIdInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type CalendarEventSeriesExceptionsFindByIdInput = z.infer<
  typeof CalendarEventSeriesExceptionsFindByIdInputSchema
>
export type CalendarEventSeriesExceptionsFindByIdOutput = CalendarEventSeriesExceptionsDTO | null

export async function findByIdCalendarEventSeriesExceptionsAction(
  input: CalendarEventSeriesExceptionsFindByIdInput
): Promise<CalendarEventSeriesExceptionsFindByIdOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "findById_calendar-event-series-exceptions" })
  const actorIdForLog = userId

  try {
    const validated = CalendarEventSeriesExceptionsFindByIdInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new CalendarEventSeriesExceptionsSupabaseRepository(supabase)
    const result = await repository.findById(validated.id)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "calendar.calendar-event-series-exceptions.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_calendar-event-series-exceptions_success",
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
      component: "calendar.calendar-event-series-exceptions.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_calendar-event-series-exceptions_failed",
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
