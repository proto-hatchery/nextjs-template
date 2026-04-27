/**
 * findByIdCalendarHolidaysAction
 *
 * @module @workspace/supabase-data/actions/calendar/calendar-holidays-findById.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { CalendarHolidaysDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-holidays.dto.codegen"
import { CalendarHolidaysSupabaseRepository } from "@workspace/supabase-data/modules/calendar/infrastructure/repositories/calendar-holidays-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const CalendarHolidaysFindByIdInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type CalendarHolidaysFindByIdInput = z.infer<typeof CalendarHolidaysFindByIdInputSchema>
export type CalendarHolidaysFindByIdOutput = CalendarHolidaysDTO | null

export async function findByIdCalendarHolidaysAction(
  input: CalendarHolidaysFindByIdInput
): Promise<CalendarHolidaysFindByIdOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "findById_calendar-holidays" })
  const actorIdForLog = userId

  try {
    const validated = CalendarHolidaysFindByIdInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new CalendarHolidaysSupabaseRepository(supabase)
    const result = await repository.findById(validated.id)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "calendar.calendar-holidays.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_calendar-holidays_success",
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
      component: "calendar.calendar-holidays.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_calendar-holidays_failed",
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
