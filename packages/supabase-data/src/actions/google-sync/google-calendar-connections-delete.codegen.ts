/**
 * DeleteGoogleCalendarConnections Server Action
 * 
 * Handles delete operation for google_calendar_connections.
 * 
 * ## Usage
 * 
 * Example:
 * ```typescript
 * import { deleteGoogleCalendarConnectionsAction } from "@workspace/supabase-data/actions/google-sync/google-calendar-connections-delete.codegen"
 * 
 * const result = await deleteGoogleCalendarConnectionsAction(input)
 * ```
 * 
 * @module @workspace/supabase-data/actions/google-sync/google-calendar-connections-delete
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { GoogleCalendarConnectionsSupabaseRepository } from "@workspace/supabase-data/modules/google-sync/infrastructure/repositories/google-calendar-connections-supabase.repository.codegen"
import { logServerEvent } from "@workspace/logging/server"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"

/**
 * Audit-safe fields for this table (HIPAA §164.312(b) compliant)
 * 
 * These fields are safe to log in error metadata without exposing PHI.
 */
const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

/**
 * Input schema for deleteGoogleCalendarConnectionsAction
 * 
 * Uses Zod v4 syntax (top-level APIs, not z.string().email() etc.)
 */
const GoogleCalendarConnectionsDeleteInputSchema = z.object({
  // TODO: Define input fields based on google_calendar_connections.delete requirements
  // Example for insert (Zod v4 syntax):
  // email: z.email({ error: "Invalid email" }),
  // id: z.uuid({ error: "Invalid UUID" }),
  // url: z.url({ error: "Invalid URL" }),
  // datetime: z.iso.datetime({ error: "Invalid datetime" }),
  // metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Input type for deleteGoogleCalendarConnectionsAction
 */
export type GoogleCalendarConnectionsDeleteInput = z.infer<typeof GoogleCalendarConnectionsDeleteInputSchema>

/**
 * Output type for deleteGoogleCalendarConnectionsAction — unknown until the action is wired to real DTOs / port types.
 */
export type GoogleCalendarConnectionsDeleteOutput = unknown

/**
 * DeleteGoogleCalendarConnections Server Action
 * 
 * @param input - Action input
 */
export async function deleteGoogleCalendarConnectionsAction(
  input: GoogleCalendarConnectionsDeleteInput
): Promise<GoogleCalendarConnectionsDeleteOutput> {
  const startedAt = Date.now()
  let actorIdForLog = "unknown"

  try {
    // 1. Identity + rate limit (SSOT via requireAuth)
    const { userId } = await requireAuth({
      action: "delete_google-calendar-connections",
    })
    actorIdForLog = userId
    // 2. Input validation — before any DB call
    const validated = GoogleCalendarConnectionsDeleteInputSchema.parse(input)

    // 3. Auth client — created after all guards pass
    const supabase = await createServerAuthClient()
    const repository = new GoogleCalendarConnectionsSupabaseRepository(supabase)
    
    // 4. Execute operation — pass resolved context explicitly
    // @type-escape: generated action stub — delete id unknown until TODO input schema
    await repository.delete((validated as unknown as { id: string }).id)

    // 5. Log success
    await logServerEvent({
      actorId: userId,
      actorType: "user",
      component: "google-sync.google-calendar-connections.delete",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "delete_google-calendar-connections_success",
      operation: "delete",
      operationType: "action",
      outcome: "success",
      service: "supabase-data",
    })

    return null as GoogleCalendarConnectionsDeleteOutput
  } catch (error) {
    // 6. Log error with sanitized metadata (HIPAA compliant)
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "google-sync.google-calendar-connections.delete",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "delete_google-calendar-connections_failed",
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
