/**
 * updateGoogleCalendarConnectionsAction
 *
 * @module @workspace/supabase-data/actions/google-calendar/google-calendar-connections-update.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { GoogleCalendarConnectionsDTO } from "@workspace/supabase-data/modules/google-calendar/domain/dto/google-calendar-connections.dto.codegen"
import { GoogleCalendarConnectionsSupabaseRepository } from "@workspace/supabase-data/modules/google-calendar/infrastructure/repositories/google-calendar-connections-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const GoogleCalendarConnectionsUpdateInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
  data: z
    .object({
      accessToken: z.string().nullable().optional(),
      accessTokenEncrypted: z.string().nullable().optional(),
      autoCreateMeetForSessions: z.boolean().optional(),
      consecutiveErrors: z.number().optional(),
      googleCalendarId: z.uuid({ error: "Invalid UUID" }).optional(),
      googleEmail: z.string().optional(),
      isConnected: z.boolean().optional(),
      lastFullSyncAt: z.string().nullable().optional(),
      lastIncrementalSyncAt: z.string().nullable().optional(),
      lastSuccessfulSyncAt: z.string().nullable().optional(),
      lastSyncAt: z.string().nullable().optional(),
      lastSyncError: z.string().nullable().optional(),
      lastSyncErrorCode: z.string().nullable().optional(),
      lastWatchRenewalAt: z.string().nullable().optional(),
      lastWebhookAt: z.string().nullable().optional(),
      psychologistId: z.uuid({ error: "Invalid UUID" }).optional(),
      refreshErrorCount: z.number().optional(),
      refreshToken: z.string().nullable().optional(),
      refreshTokenEncrypted: z.string().nullable().optional(),
      showEventDetails: z.boolean().optional(),
      showPatientName: z.boolean().optional(),
      syncBlocks: z.boolean().optional(),
      syncEnabled: z.boolean().optional(),
      syncFromGoogle: z.boolean().optional(),
      syncMeetings: z.boolean().optional(),
      syncOther: z.boolean().optional(),
      syncSessions: z.boolean().optional(),
      syncState: z.string().optional(),
      syncSupervisions: z.boolean().optional(),
      syncTasks: z.boolean().optional(),
      syncToGoogle: z.boolean().optional(),
      syncToken: z.string().nullable().optional(),
      syncTokenUpdatedAt: z.string().nullable().optional(),
      tokenExpiresAt: z.string().optional(),
      watchChannelId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      watchChannelToken: z.string().nullable().optional(),
      watchExpiration: z.string().nullable().optional(),
      watchExpiresAt: z.string().nullable().optional(),
      watchResourceId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
})

export type GoogleCalendarConnectionsUpdateInput = z.infer<
  typeof GoogleCalendarConnectionsUpdateInputSchema
>
export type GoogleCalendarConnectionsUpdateOutput = GoogleCalendarConnectionsDTO

export async function updateGoogleCalendarConnectionsAction(
  input: GoogleCalendarConnectionsUpdateInput
): Promise<GoogleCalendarConnectionsUpdateOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "update_google-calendar-connections" })
  const actorIdForLog = userId

  try {
    const validated = GoogleCalendarConnectionsUpdateInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new GoogleCalendarConnectionsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<GoogleCalendarConnectionsDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated.data).filter(([, value]) => value !== undefined)
    ) as Partial<GoogleCalendarConnectionsDTO>
    const result = await repository.update(validated.id, repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "google-calendar.google-calendar-connections.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_google-calendar-connections_success",
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
      component: "google-calendar.google-calendar-connections.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_google-calendar-connections_failed",
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
