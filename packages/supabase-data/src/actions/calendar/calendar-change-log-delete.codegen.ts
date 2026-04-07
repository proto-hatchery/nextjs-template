/**
 * DeleteCalendarChangeLog Server Action
 * 
 * Handles delete operation for calendar_change_log.
 * 
 * ## Usage
 * 
 * Example:
 * ```typescript
 * import { deleteCalendarChangeLogAction } from "@workspace/supabase-data/actions/calendar/calendar-change-log-delete.codegen"
 * 
 * const result = await deleteCalendarChangeLogAction(input)
 * ```
 * 
 * @module @workspace/supabase-data/actions/calendar/calendar-change-log-delete
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { CalendarChangeLogSupabaseRepository } from "@workspace/supabase-data/modules/calendar/infrastructure/repositories/calendar-change-log-supabase.repository.codegen"
import { logServerEvent } from "@workspace/logging/server"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"

/**
 * Audit-safe fields for this table (HIPAA §164.312(b) compliant)
 * 
 * These fields are safe to log in error metadata without exposing PHI.
 */
const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

/**
 * Input schema for deleteCalendarChangeLogAction
 * 
 * Uses Zod v4 syntax (top-level APIs, not z.string().email() etc.)
 */
const CalendarChangeLogDeleteInputSchema = z.object({
  // TODO: Define input fields based on calendar_change_log.delete requirements
  // Example for insert (Zod v4 syntax):
  // email: z.email({ error: "Invalid email" }),
  // id: z.uuid({ error: "Invalid UUID" }),
  // url: z.url({ error: "Invalid URL" }),
  // datetime: z.iso.datetime({ error: "Invalid datetime" }),
  // metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Input type for deleteCalendarChangeLogAction
 */
export type CalendarChangeLogDeleteInput = z.infer<typeof CalendarChangeLogDeleteInputSchema>

/**
 * Output type for deleteCalendarChangeLogAction — unknown until the action is wired to real DTOs / port types.
 */
export type CalendarChangeLogDeleteOutput = unknown

/**
 * DeleteCalendarChangeLog Server Action
 * 
 * @param input - Action input
 */
export async function deleteCalendarChangeLogAction(
  input: CalendarChangeLogDeleteInput
): Promise<CalendarChangeLogDeleteOutput> {
  const startedAt = Date.now()
  let actorIdForLog = "unknown"

  try {
    // 1. Identity + rate limit (SSOT via requireAuth)
    const { userId } = await requireAuth({
      action: "delete_calendar-change-log",
    })
    actorIdForLog = userId
    // 2. Input validation — before any DB call
    const validated = CalendarChangeLogDeleteInputSchema.parse(input)

    // 3. Auth client — created after all guards pass
    const supabase = await createServerAuthClient()
    const repository = new CalendarChangeLogSupabaseRepository(supabase)
    
    // 4. Execute operation — pass resolved context explicitly
    // @type-escape: generated action stub — delete id unknown until TODO input schema
    await repository.delete((validated as unknown as { id: string }).id)

    // 5. Log success
    await logServerEvent({
      actorId: userId,
      actorType: "user",
      component: "calendar.calendar-change-log.delete",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "delete_calendar-change-log_success",
      operation: "delete",
      operationType: "action",
      outcome: "success",
      service: "supabase-data",
    })

    return null as CalendarChangeLogDeleteOutput
  } catch (error) {
    // 6. Log error with sanitized metadata (HIPAA compliant)
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "calendar.calendar-change-log.delete",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "delete_calendar-change-log_failed",
      operation: "delete",
      operationType: "action",
      outcome: "failure",
      error,
      metadata: sanitizeForAudit(input as Record<string, unknown>, AUDIT_SAFE_FIELDS),
      service: "supabase-data",
    })

    throw error
  }
}
