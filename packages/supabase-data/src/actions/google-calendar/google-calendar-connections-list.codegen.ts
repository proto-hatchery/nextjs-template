/**
 * listGoogleCalendarConnectionsAction
 *
 * @module @workspace/supabase-data/actions/google-calendar/google-calendar-connections-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { GoogleCalendarConnectionsDTO } from "@workspace/supabase-data/modules/google-calendar/domain/dto/google-calendar-connections.dto.codegen"
import type { GoogleCalendarConnectionsListParams } from "@workspace/supabase-data/modules/google-calendar/domain/ports/google-calendar-connections-repository.port.codegen"
import { GoogleCalendarConnectionsSupabaseRepository } from "@workspace/supabase-data/modules/google-calendar/infrastructure/repositories/google-calendar-connections-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const GoogleCalendarConnectionsListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type GoogleCalendarConnectionsListInput = z.infer<
  typeof GoogleCalendarConnectionsListInputSchema
>
export type GoogleCalendarConnectionsListOutput = { rows: GoogleCalendarConnectionsDTO[] }

export async function listGoogleCalendarConnectionsAction(
  input: GoogleCalendarConnectionsListInput
): Promise<GoogleCalendarConnectionsListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_google-calendar-connections" })
  const actorIdForLog = userId

  try {
    const validated = GoogleCalendarConnectionsListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new GoogleCalendarConnectionsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies GoogleCalendarConnectionsListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as GoogleCalendarConnectionsListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "google-calendar.google-calendar-connections.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_google-calendar-connections_success",
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
      component: "google-calendar.google-calendar-connections.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_google-calendar-connections_failed",
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
