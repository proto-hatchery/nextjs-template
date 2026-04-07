// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { Database } from "@workspace/supabase-infra/types/database"

import { GoogleCalendarConnectionsDTOSchema, type GoogleCalendarConnectionsDTO } from "@workspace/supabase-data/modules/google-sync/domain/dto/google-calendar-connections.dto.codegen"

type GoogleCalendarConnectionsRow = Database["public"]["Tables"]["google_calendar_connections"]["Row"]
type GoogleCalendarConnectionsInsert = Database["public"]["Tables"]["google_calendar_connections"]["Insert"]
type GoogleCalendarConnectionsUpdate = Database["public"]["Tables"]["google_calendar_connections"]["Update"]

const GoogleCalendarConnectionsFieldMappings = {
  accessToken: "access_token",
  accessTokenEncrypted: "access_token_encrypted",
  autoCreateMeetForSessions: "auto_create_meet_for_sessions",
  consecutiveErrors: "consecutive_errors",
  createdAt: "created_at",
  googleCalendarId: "google_calendar_id",
  googleEmail: "google_email",
  id: "id",
  isConnected: "is_connected",
  lastFullSyncAt: "last_full_sync_at",
  lastIncrementalSyncAt: "last_incremental_sync_at",
  lastSuccessfulSyncAt: "last_successful_sync_at",
  lastSyncAt: "last_sync_at",
  lastSyncError: "last_sync_error",
  lastSyncErrorCode: "last_sync_error_code",
  lastWatchRenewalAt: "last_watch_renewal_at",
  lastWebhookAt: "last_webhook_at",
  psychologistId: "psychologist_id",
  refreshErrorCount: "refresh_error_count",
  refreshToken: "refresh_token",
  refreshTokenEncrypted: "refresh_token_encrypted",
  showEventDetails: "show_event_details",
  showPatientName: "show_patient_name",
  syncBlocks: "sync_blocks",
  syncEnabled: "sync_enabled",
  syncFromGoogle: "sync_from_google",
  syncMeetings: "sync_meetings",
  syncOther: "sync_other",
  syncSessions: "sync_sessions",
  syncState: "sync_state",
  syncSupervisions: "sync_supervisions",
  syncTasks: "sync_tasks",
  syncToGoogle: "sync_to_google",
  syncToken: "sync_token",
  syncTokenUpdatedAt: "sync_token_updated_at",
  tokenExpiresAt: "token_expires_at",
  updatedAt: "updated_at",
  watchChannelId: "watch_channel_id",
  watchChannelToken: "watch_channel_token",
  watchExpiration: "watch_expiration",
  watchExpiresAt: "watch_expires_at",
  watchResourceId: "watch_resource_id",
} as const

type GoogleCalendarConnectionsField = keyof typeof GoogleCalendarConnectionsFieldMappings

function fromGoogleCalendarConnectionsRow(row: GoogleCalendarConnectionsRow): GoogleCalendarConnectionsDTO {
  const mapped = {
    accessToken: row.access_token,
    accessTokenEncrypted: row.access_token_encrypted,
    autoCreateMeetForSessions: row.auto_create_meet_for_sessions,
    consecutiveErrors: row.consecutive_errors,
    createdAt: row.created_at,
    googleCalendarId: row.google_calendar_id,
    googleEmail: row.google_email,
    id: row.id,
    isConnected: row.is_connected,
    lastFullSyncAt: row.last_full_sync_at,
    lastIncrementalSyncAt: row.last_incremental_sync_at,
    lastSuccessfulSyncAt: row.last_successful_sync_at,
    lastSyncAt: row.last_sync_at,
    lastSyncError: row.last_sync_error,
    lastSyncErrorCode: row.last_sync_error_code,
    lastWatchRenewalAt: row.last_watch_renewal_at,
    lastWebhookAt: row.last_webhook_at,
    psychologistId: row.psychologist_id,
    refreshErrorCount: row.refresh_error_count,
    refreshToken: row.refresh_token,
    refreshTokenEncrypted: row.refresh_token_encrypted,
    showEventDetails: row.show_event_details,
    showPatientName: row.show_patient_name,
    syncBlocks: row.sync_blocks,
    syncEnabled: row.sync_enabled,
    syncFromGoogle: row.sync_from_google,
    syncMeetings: row.sync_meetings,
    syncOther: row.sync_other,
    syncSessions: row.sync_sessions,
    syncState: row.sync_state,
    syncSupervisions: row.sync_supervisions,
    syncTasks: row.sync_tasks,
    syncToGoogle: row.sync_to_google,
    syncToken: row.sync_token,
    syncTokenUpdatedAt: row.sync_token_updated_at,
    tokenExpiresAt: row.token_expires_at,
    updatedAt: row.updated_at,
    watchChannelId: row.watch_channel_id,
    watchChannelToken: row.watch_channel_token,
    watchExpiration: row.watch_expiration,
    watchExpiresAt: row.watch_expires_at,
    watchResourceId: row.watch_resource_id,
  }
  return GoogleCalendarConnectionsDTOSchema.parse(mapped)
}

function toGoogleCalendarConnectionsInsert(dto: Partial<GoogleCalendarConnectionsDTO>): GoogleCalendarConnectionsInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(GoogleCalendarConnectionsFieldMappings) as Array<
    [GoogleCalendarConnectionsField, (typeof GoogleCalendarConnectionsFieldMappings)[GoogleCalendarConnectionsField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as GoogleCalendarConnectionsInsert
}

function toGoogleCalendarConnectionsUpdate(dto: Partial<GoogleCalendarConnectionsDTO>): GoogleCalendarConnectionsUpdate {
  return toGoogleCalendarConnectionsInsert(dto) as GoogleCalendarConnectionsUpdate
}

export { fromGoogleCalendarConnectionsRow, toGoogleCalendarConnectionsInsert, toGoogleCalendarConnectionsUpdate }
