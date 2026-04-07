// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { Database } from "@workspace/supabase-infra/types/database"

import { GoogleSyncInboundCoalesceDTOSchema, type GoogleSyncInboundCoalesceDTO } from "@workspace/supabase-data/modules/google-sync/domain/dto/google-sync-inbound-coalesce.dto.codegen"

type GoogleSyncInboundCoalesceRow = Database["public"]["Tables"]["google_sync_inbound_coalesce"]["Row"]
type GoogleSyncInboundCoalesceInsert = Database["public"]["Tables"]["google_sync_inbound_coalesce"]["Insert"]
type GoogleSyncInboundCoalesceUpdate = Database["public"]["Tables"]["google_sync_inbound_coalesce"]["Update"]

const GoogleSyncInboundCoalesceFieldMappings = {
  connectionId: "connection_id",
  createdAt: "created_at",
  lastEnqueuedAt: "last_enqueued_at",
  msgId: "msg_id",
} as const

type GoogleSyncInboundCoalesceField = keyof typeof GoogleSyncInboundCoalesceFieldMappings

function fromGoogleSyncInboundCoalesceRow(row: GoogleSyncInboundCoalesceRow): GoogleSyncInboundCoalesceDTO {
  const mapped = {
    connectionId: row.connection_id,
    createdAt: row.created_at,
    lastEnqueuedAt: row.last_enqueued_at,
    msgId: row.msg_id,
  }
  return GoogleSyncInboundCoalesceDTOSchema.parse(mapped)
}

function toGoogleSyncInboundCoalesceInsert(dto: Partial<GoogleSyncInboundCoalesceDTO>): GoogleSyncInboundCoalesceInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(GoogleSyncInboundCoalesceFieldMappings) as Array<
    [GoogleSyncInboundCoalesceField, (typeof GoogleSyncInboundCoalesceFieldMappings)[GoogleSyncInboundCoalesceField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as GoogleSyncInboundCoalesceInsert
}

function toGoogleSyncInboundCoalesceUpdate(dto: Partial<GoogleSyncInboundCoalesceDTO>): GoogleSyncInboundCoalesceUpdate {
  return toGoogleSyncInboundCoalesceInsert(dto) as GoogleSyncInboundCoalesceUpdate
}

export { fromGoogleSyncInboundCoalesceRow, toGoogleSyncInboundCoalesceInsert, toGoogleSyncInboundCoalesceUpdate }
