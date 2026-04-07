/**
 * ListCalendarHolidays Server Action
 * 
 * Handles list operation for calendar_holidays.
 * 
 * ## Usage
 * 
 * Example:
 * ```typescript
 * import { listCalendarHolidaysAction } from "@workspace/supabase-data/actions/calendar/calendar-holidays-list.codegen"
 * 
 * const result = await listCalendarHolidaysAction(input)
 * ```
 * 
 * @module @workspace/supabase-data/actions/calendar/calendar-holidays-list
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { CalendarHolidaysSupabaseRepository } from "@workspace/supabase-data/modules/calendar/infrastructure/repositories/calendar-holidays-supabase.repository.codegen"
import { logServerEvent } from "@workspace/logging/server"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"

/**
 * Audit-safe fields for this table (HIPAA §164.312(b) compliant)
 * 
 * These fields are safe to log in error metadata without exposing PHI.
 */
const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

/**
 * Input schema for listCalendarHolidaysAction
 * 
 * Uses Zod v4 syntax (top-level APIs, not z.string().email() etc.)
 */
const CalendarHolidaysListInputSchema = z.object({
  // TODO: Define input fields based on calendar_holidays.list requirements
  // Example for insert (Zod v4 syntax):
  // email: z.email({ error: "Invalid email" }),
  // id: z.uuid({ error: "Invalid UUID" }),
  // url: z.url({ error: "Invalid URL" }),
  // datetime: z.iso.datetime({ error: "Invalid datetime" }),
  // metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Input type for listCalendarHolidaysAction
 */
export type CalendarHolidaysListInput = z.infer<typeof CalendarHolidaysListInputSchema>

/**
 * Output type for listCalendarHolidaysAction — unknown until the action is wired to real DTOs / port types.
 */
export type CalendarHolidaysListOutput = unknown

/**
 * ListCalendarHolidays Server Action
 * 
 * @param input - Action input
 */
export async function listCalendarHolidaysAction(
  input: CalendarHolidaysListInput
): Promise<CalendarHolidaysListOutput> {
  const startedAt = Date.now()
  let actorIdForLog = "unknown"

  try {
    // 1. Identity + rate limit (SSOT via requireAuth)
    const { userId } = await requireAuth({
      action: "list_calendar-holidays",
    })
    actorIdForLog = userId
    // 2. Input validation — before any DB call
    const validated = CalendarHolidaysListInputSchema.parse(input)

    // 3. Auth client — created after all guards pass
    const supabase = await createServerAuthClient()
    const repository = new CalendarHolidaysSupabaseRepository(supabase)
    
    // 4. Execute operation — pass resolved context explicitly
    // @type-escape: generated action stub — list params unknown until semantic plan fills Zod input
    const result = await repository.list(validated as never)

    // 5. Log success
    await logServerEvent({
      actorId: userId,
      actorType: "user",
      component: "calendar.calendar-holidays.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_calendar-holidays_success",
      operation: "list",
      operationType: "action",
      outcome: "success",
      service: "supabase-data",
    })

    return result
  } catch (error) {
    // 6. Log error with sanitized metadata (HIPAA compliant)
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "calendar.calendar-holidays.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_calendar-holidays_failed",
      operation: "list",
      operationType: "action",
      outcome: "failure",
      error,
      metadata: sanitizeForAudit(input as Record<string, unknown>, AUDIT_SAFE_FIELDS),
      service: "supabase-data",
    })

    throw error
  }
}
