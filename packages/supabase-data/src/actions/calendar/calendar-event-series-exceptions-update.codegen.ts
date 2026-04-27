/**
 * updateCalendarEventSeriesExceptionsAction
 *
 * @module @workspace/supabase-data/actions/calendar/calendar-event-series-exceptions-update.codegen
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

const CalendarEventSeriesExceptionsUpdateInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
  data: z
    .object({
      exceptionType: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
      modifiedFields: z
        .union([z.string(), z.number(), z.boolean(), z.null()])
        .nullable()
        .optional(),
      newEndDatetime: z.string().nullable().optional(),
      newStartDatetime: z.string().nullable().optional(),
      originalDate: z.string().optional(),
      reason: z.string().nullable().optional(),
      seriesId: z.uuid({ error: "Invalid UUID" }).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
})

export type CalendarEventSeriesExceptionsUpdateInput = z.infer<
  typeof CalendarEventSeriesExceptionsUpdateInputSchema
>
export type CalendarEventSeriesExceptionsUpdateOutput = CalendarEventSeriesExceptionsDTO

export async function updateCalendarEventSeriesExceptionsAction(
  input: CalendarEventSeriesExceptionsUpdateInput
): Promise<CalendarEventSeriesExceptionsUpdateOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "update_calendar-event-series-exceptions" })
  const actorIdForLog = userId

  try {
    const validated = CalendarEventSeriesExceptionsUpdateInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new CalendarEventSeriesExceptionsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<CalendarEventSeriesExceptionsDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated.data).filter(([, value]) => value !== undefined)
    ) as Partial<CalendarEventSeriesExceptionsDTO>
    const result = await repository.update(validated.id, repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "calendar.calendar-event-series-exceptions.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_calendar-event-series-exceptions_success",
      operation: "update",
      operationType: "action",
      outcome: "success",
      metadata: {
        // @type-escape: DTO id field type is unknown at codegen time — safe to narrow to primitive at logging boundary
        id: (result as { id?: string | number | boolean | null }).id ?? validated.id,
      },
      service: "supabase-data",
    })

    return result
  } catch (error) {
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "calendar.calendar-event-series-exceptions.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_calendar-event-series-exceptions_failed",
      operation: "update",
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
