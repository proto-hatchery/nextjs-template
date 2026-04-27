/**
 * updateCalendarEventSeriesAction
 *
 * @module @workspace/supabase-data/actions/calendar/calendar-event-series-update.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { CalendarEventSeriesDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-event-series.dto.codegen"
import { CalendarEventSeriesSupabaseRepository } from "@workspace/supabase-data/modules/calendar/infrastructure/repositories/calendar-event-series-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const CalendarEventSeriesUpdateInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
  data: z
    .object({
      allDay: z.boolean().optional(),
      color: z.string().nullable().optional(),
      description: z.string().nullable().optional(),
      durationMinutes: z.number().optional(),
      effectiveEnd: z.string().nullable().optional(),
      effectiveStart: z.string().optional(),
      endTime: z.string().optional(),
      eventType: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
      googleEventId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      googleSyncStatus: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
      location: z.string().nullable().optional(),
      metadata: z.union([z.string(), z.number(), z.boolean(), z.null()]).nullable().optional(),
      psychologistId: z.uuid({ error: "Invalid UUID" }).optional(),
      rrule: z.string().optional(),
      startTime: z.string().optional(),
      timezone: z.string().optional(),
      title: z.string().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
})

export type CalendarEventSeriesUpdateInput = z.infer<typeof CalendarEventSeriesUpdateInputSchema>
export type CalendarEventSeriesUpdateOutput = CalendarEventSeriesDTO

export async function updateCalendarEventSeriesAction(
  input: CalendarEventSeriesUpdateInput
): Promise<CalendarEventSeriesUpdateOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "update_calendar-event-series" })
  const actorIdForLog = userId

  try {
    const validated = CalendarEventSeriesUpdateInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new CalendarEventSeriesSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<CalendarEventSeriesDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated.data).filter(([, value]) => value !== undefined)
    ) as Partial<CalendarEventSeriesDTO>
    const result = await repository.update(validated.id, repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "calendar.calendar-event-series.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_calendar-event-series_success",
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
      component: "calendar.calendar-event-series.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_calendar-event-series_failed",
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
