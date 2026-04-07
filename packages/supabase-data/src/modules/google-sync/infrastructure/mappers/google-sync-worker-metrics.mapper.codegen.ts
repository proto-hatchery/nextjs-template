// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { Database } from "@workspace/supabase-infra/types/database"

import { GoogleSyncWorkerMetricsDTOSchema, type GoogleSyncWorkerMetricsDTO } from "@workspace/supabase-data/modules/google-sync/domain/dto/google-sync-worker-metrics.dto.codegen"

type GoogleSyncWorkerMetricsRow = Database["public"]["Tables"]["google_sync_worker_metrics"]["Row"]
type GoogleSyncWorkerMetricsInsert = Database["public"]["Tables"]["google_sync_worker_metrics"]["Insert"]
type GoogleSyncWorkerMetricsUpdate = Database["public"]["Tables"]["google_sync_worker_metrics"]["Update"]

const GoogleSyncWorkerMetricsFieldMappings = {
  backlogAfter: "backlog_after",
  batchSize: "batch_size",
  durationMs: "duration_ms",
  failed: "failed",
  id: "id",
  metadata: "metadata",
  queueName: "queue_name",
  recordedAt: "recorded_at",
  requeued: "requeued",
  skipped: "skipped",
  successful: "successful",
  workerId: "worker_id",
} as const

type GoogleSyncWorkerMetricsField = keyof typeof GoogleSyncWorkerMetricsFieldMappings

function fromGoogleSyncWorkerMetricsRow(row: GoogleSyncWorkerMetricsRow): GoogleSyncWorkerMetricsDTO {
  const mapped = {
    backlogAfter: row.backlog_after,
    batchSize: row.batch_size,
    durationMs: row.duration_ms,
    failed: row.failed,
    id: row.id,
    metadata: row.metadata,
    queueName: row.queue_name,
    recordedAt: row.recorded_at,
    requeued: row.requeued,
    skipped: row.skipped,
    successful: row.successful,
    workerId: row.worker_id,
  }
  return GoogleSyncWorkerMetricsDTOSchema.parse(mapped)
}

function toGoogleSyncWorkerMetricsInsert(dto: Partial<GoogleSyncWorkerMetricsDTO>): GoogleSyncWorkerMetricsInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(GoogleSyncWorkerMetricsFieldMappings) as Array<
    [GoogleSyncWorkerMetricsField, (typeof GoogleSyncWorkerMetricsFieldMappings)[GoogleSyncWorkerMetricsField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as GoogleSyncWorkerMetricsInsert
}

function toGoogleSyncWorkerMetricsUpdate(dto: Partial<GoogleSyncWorkerMetricsDTO>): GoogleSyncWorkerMetricsUpdate {
  return toGoogleSyncWorkerMetricsInsert(dto) as GoogleSyncWorkerMetricsUpdate
}

export { fromGoogleSyncWorkerMetricsRow, toGoogleSyncWorkerMetricsInsert, toGoogleSyncWorkerMetricsUpdate }
