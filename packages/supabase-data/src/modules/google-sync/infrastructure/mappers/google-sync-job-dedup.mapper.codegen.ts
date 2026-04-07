// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { Database } from "@workspace/supabase-infra/types/database"

import { GoogleSyncJobDedupDTOSchema, type GoogleSyncJobDedupDTO } from "@workspace/supabase-data/modules/google-sync/domain/dto/google-sync-job-dedup.dto.codegen"

type GoogleSyncJobDedupRow = Database["public"]["Tables"]["google_sync_job_dedup"]["Row"]
type GoogleSyncJobDedupInsert = Database["public"]["Tables"]["google_sync_job_dedup"]["Insert"]
type GoogleSyncJobDedupUpdate = Database["public"]["Tables"]["google_sync_job_dedup"]["Update"]

const GoogleSyncJobDedupFieldMappings = {
  idempotencyKey: "idempotency_key",
  outcome: "outcome",
  processedAt: "processed_at",
} as const

type GoogleSyncJobDedupField = keyof typeof GoogleSyncJobDedupFieldMappings

function fromGoogleSyncJobDedupRow(row: GoogleSyncJobDedupRow): GoogleSyncJobDedupDTO {
  const mapped = {
    idempotencyKey: row.idempotency_key,
    outcome: row.outcome,
    processedAt: row.processed_at,
  }
  return GoogleSyncJobDedupDTOSchema.parse(mapped)
}

function toGoogleSyncJobDedupInsert(dto: Partial<GoogleSyncJobDedupDTO>): GoogleSyncJobDedupInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(GoogleSyncJobDedupFieldMappings) as Array<
    [GoogleSyncJobDedupField, (typeof GoogleSyncJobDedupFieldMappings)[GoogleSyncJobDedupField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as GoogleSyncJobDedupInsert
}

function toGoogleSyncJobDedupUpdate(dto: Partial<GoogleSyncJobDedupDTO>): GoogleSyncJobDedupUpdate {
  return toGoogleSyncJobDedupInsert(dto) as GoogleSyncJobDedupUpdate
}

export { fromGoogleSyncJobDedupRow, toGoogleSyncJobDedupInsert, toGoogleSyncJobDedupUpdate }
