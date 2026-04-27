/**
 * listCalendarEventSeriesExceptionsAction
 *
 * @module @workspace/supabase-data/actions/calendar/calendar-event-series-exceptions-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { CalendarEventSeriesExceptionsDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-event-series-exceptions.dto.codegen"
import type { CalendarEventSeriesExceptionsListParams } from "@workspace/supabase-data/modules/calendar/domain/ports/calendar-event-series-exceptions-repository.port.codegen"
import { CalendarEventSeriesExceptionsSupabaseRepository } from "@workspace/supabase-data/modules/calendar/infrastructure/repositories/calendar-event-series-exceptions-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const CalendarEventSeriesExceptionsListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type CalendarEventSeriesExceptionsListInput = z.infer<
  typeof CalendarEventSeriesExceptionsListInputSchema
>
export type CalendarEventSeriesExceptionsListOutput = { rows: CalendarEventSeriesExceptionsDTO[] }

export async function listCalendarEventSeriesExceptionsAction(
  input: CalendarEventSeriesExceptionsListInput
): Promise<CalendarEventSeriesExceptionsListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_calendar-event-series-exceptions" })
  const actorIdForLog = userId

  try {
    const validated = CalendarEventSeriesExceptionsListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new CalendarEventSeriesExceptionsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies CalendarEventSeriesExceptionsListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as CalendarEventSeriesExceptionsListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "calendar.calendar-event-series-exceptions.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_calendar-event-series-exceptions_success",
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
      component: "calendar.calendar-event-series-exceptions.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_calendar-event-series-exceptions_failed",
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
