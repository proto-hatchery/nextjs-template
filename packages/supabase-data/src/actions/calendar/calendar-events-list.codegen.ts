/**
 * listCalendarEventsAction
 *
 * @module @workspace/supabase-data/actions/calendar/calendar-events-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { CalendarEventsDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-events.dto.codegen"
import type { CalendarEventsListParams } from "@workspace/supabase-data/modules/calendar/domain/ports/calendar-events-repository.port.codegen"
import { CalendarEventsSupabaseRepository } from "@workspace/supabase-data/modules/calendar/infrastructure/repositories/calendar-events-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const CalendarEventsListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type CalendarEventsListInput = z.infer<typeof CalendarEventsListInputSchema>
export type CalendarEventsListOutput = { rows: CalendarEventsDTO[] }

export async function listCalendarEventsAction(
  input: CalendarEventsListInput
): Promise<CalendarEventsListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_calendar-events" })
  const actorIdForLog = userId

  try {
    const validated = CalendarEventsListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new CalendarEventsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies CalendarEventsListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as CalendarEventsListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "calendar.calendar-events.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_calendar-events_success",
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
      component: "calendar.calendar-events.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_calendar-events_failed",
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
