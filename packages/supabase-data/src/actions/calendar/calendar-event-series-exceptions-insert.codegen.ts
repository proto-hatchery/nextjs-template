/**
 * insertCalendarEventSeriesExceptionsAction
 *
 * @module @workspace/supabase-data/actions/calendar/calendar-event-series-exceptions-insert.codegen
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

const CalendarEventSeriesExceptionsInsertInputSchema = z.object({
  exceptionType: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  modifiedFields: z.union([z.string(), z.number(), z.boolean(), z.null()]).nullable().optional(),
  newEndDatetime: z.string().nullable().optional(),
  newStartDatetime: z.string().nullable().optional(),
  originalDate: z.string(),
  reason: z.string().nullable().optional(),
  seriesId: z.uuid({ error: "Invalid UUID" }),
})

export type CalendarEventSeriesExceptionsInsertInput = z.infer<
  typeof CalendarEventSeriesExceptionsInsertInputSchema
>
export type CalendarEventSeriesExceptionsInsertOutput = CalendarEventSeriesExceptionsDTO

export async function insertCalendarEventSeriesExceptionsAction(
  input: CalendarEventSeriesExceptionsInsertInput
): Promise<CalendarEventSeriesExceptionsInsertOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "insert_calendar-event-series-exceptions" })
  const actorIdForLog = userId

  try {
    const validated = CalendarEventSeriesExceptionsInsertInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new CalendarEventSeriesExceptionsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<CalendarEventSeriesExceptionsDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as Partial<CalendarEventSeriesExceptionsDTO>
    const result = await repository.insert(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "calendar.calendar-event-series-exceptions.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_calendar-event-series-exceptions_success",
      operation: "insert",
      operationType: "action",
      outcome: "success",
      metadata: {
        // @type-escape: DTO id field type is unknown at codegen time — safe to narrow to primitive at logging boundary
        id: (result as { id?: string | number | boolean | null }).id ?? null,
      },
      service: "supabase-data",
    })

    return result
  } catch (error) {
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "calendar.calendar-event-series-exceptions.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_calendar-event-series-exceptions_failed",
      operation: "insert",
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
