// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { Database } from "@workspace/supabase-infra/types/database"

import { GoogleSyncIdempotencyDTOSchema, type GoogleSyncIdempotencyDTO } from "@workspace/supabase-data/modules/google-sync/domain/dto/google-sync-idempotency.dto.codegen"

type GoogleSyncIdempotencyRow = Database["public"]["Tables"]["google_sync_idempotency"]["Row"]
type GoogleSyncIdempotencyInsert = Database["public"]["Tables"]["google_sync_idempotency"]["Insert"]
type GoogleSyncIdempotencyUpdate = Database["public"]["Tables"]["google_sync_idempotency"]["Update"]

const GoogleSyncIdempotencyFieldMappings = {
  calendarEventId: "calendar_event_id",
  completedAt: "completed_at",
  createdAt: "created_at",
  errorMessage: "error_message",
  expiresAt: "expires_at",
  idempotencyKey: "idempotency_key",
  operation: "operation",
  psychologistId: "psychologist_id",
  requestData: "request_data",
  responseData: "response_data",
  status: "status",
  updatedAt: "updated_at",
} as const

type GoogleSyncIdempotencyField = keyof typeof GoogleSyncIdempotencyFieldMappings

function fromGoogleSyncIdempotencyRow(row: GoogleSyncIdempotencyRow): GoogleSyncIdempotencyDTO {
  const mapped = {
    calendarEventId: row.calendar_event_id,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    errorMessage: row.error_message,
    expiresAt: row.expires_at,
    idempotencyKey: row.idempotency_key,
    operation: row.operation,
    psychologistId: row.psychologist_id,
    requestData: row.request_data,
    responseData: row.response_data,
    status: row.status,
    updatedAt: row.updated_at,
  }
  return GoogleSyncIdempotencyDTOSchema.parse(mapped)
}

function toGoogleSyncIdempotencyInsert(dto: Partial<GoogleSyncIdempotencyDTO>): GoogleSyncIdempotencyInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(GoogleSyncIdempotencyFieldMappings) as Array<
    [GoogleSyncIdempotencyField, (typeof GoogleSyncIdempotencyFieldMappings)[GoogleSyncIdempotencyField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as GoogleSyncIdempotencyInsert
}

function toGoogleSyncIdempotencyUpdate(dto: Partial<GoogleSyncIdempotencyDTO>): GoogleSyncIdempotencyUpdate {
  return toGoogleSyncIdempotencyInsert(dto) as GoogleSyncIdempotencyUpdate
}

export { fromGoogleSyncIdempotencyRow, toGoogleSyncIdempotencyInsert, toGoogleSyncIdempotencyUpdate }
