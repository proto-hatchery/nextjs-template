// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { Database } from "@workspace/supabase-infra/types/database"

import { GoogleSyncLogsDTOSchema, type GoogleSyncLogsDTO } from "@workspace/supabase-data/modules/google-sync/domain/dto/google-sync-logs.dto.codegen"

type GoogleSyncLogsRow = Database["public"]["Tables"]["google_sync_logs"]["Row"]
type GoogleSyncLogsInsert = Database["public"]["Tables"]["google_sync_logs"]["Insert"]
type GoogleSyncLogsUpdate = Database["public"]["Tables"]["google_sync_logs"]["Update"]

const GoogleSyncLogsFieldMappings = {
  calendarEventId: "calendar_event_id",
  completedAt: "completed_at",
  createdAt: "created_at",
  errorCode: "error_code",
  errorMessage: "error_message",
  googleEventId: "google_event_id",
  id: "id",
  operation: "operation",
  psychologistId: "psychologist_id",
  requestPayload: "request_payload",
  responsePayload: "response_payload",
  seriesId: "series_id",
  startedAt: "started_at",
  status: "status",
  syncDirection: "sync_direction",
} as const

type GoogleSyncLogsField = keyof typeof GoogleSyncLogsFieldMappings

function fromGoogleSyncLogsRow(row: GoogleSyncLogsRow): GoogleSyncLogsDTO {
  const mapped = {
    calendarEventId: row.calendar_event_id,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    errorCode: row.error_code,
    errorMessage: row.error_message,
    googleEventId: row.google_event_id,
    id: row.id,
    operation: row.operation,
    psychologistId: row.psychologist_id,
    requestPayload: row.request_payload,
    responsePayload: row.response_payload,
    seriesId: row.series_id,
    startedAt: row.started_at,
    status: row.status,
    syncDirection: row.sync_direction,
  }
  return GoogleSyncLogsDTOSchema.parse(mapped)
}

function toGoogleSyncLogsInsert(dto: Partial<GoogleSyncLogsDTO>): GoogleSyncLogsInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(GoogleSyncLogsFieldMappings) as Array<
    [GoogleSyncLogsField, (typeof GoogleSyncLogsFieldMappings)[GoogleSyncLogsField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as GoogleSyncLogsInsert
}

function toGoogleSyncLogsUpdate(dto: Partial<GoogleSyncLogsDTO>): GoogleSyncLogsUpdate {
  return toGoogleSyncLogsInsert(dto) as GoogleSyncLogsUpdate
}

export { fromGoogleSyncLogsRow, toGoogleSyncLogsInsert, toGoogleSyncLogsUpdate }
