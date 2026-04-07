// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"

import type { GoogleSyncWorkerMetricsRepository, GoogleSyncWorkerMetricsListParams, GoogleSyncWorkerMetricsListResult } from "@workspace/supabase-data/modules/google-sync/domain/ports/google-sync-worker-metrics-repository.port.codegen"
import { fromGoogleSyncWorkerMetricsRow, toGoogleSyncWorkerMetricsInsert, toGoogleSyncWorkerMetricsUpdate } from "@workspace/supabase-data/modules/google-sync/infrastructure/mappers/google-sync-worker-metrics.mapper.codegen"
import type { GoogleSyncWorkerMetricsDTO } from "@workspace/supabase-data/modules/google-sync/domain/dto/google-sync-worker-metrics.dto.codegen"

class GoogleSyncWorkerMetricsSupabaseRepository implements GoogleSyncWorkerMetricsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<GoogleSyncWorkerMetricsDTO | null> {
    const { data, error } = await this.supabase
      .from("google_sync_worker_metrics")
      .select("backlog_after, batch_size, duration_ms, failed, id, metadata, queue_name, recorded_at, requeued, skipped, successful, worker_id")
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load google_sync_worker_metrics.", { cause: error })
    }
    if (!data) return null
    return fromGoogleSyncWorkerMetricsRow(data)
  }

  async list(params: GoogleSyncWorkerMetricsListParams): Promise<GoogleSyncWorkerMetricsListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase.from("google_sync_worker_metrics").select("backlog_after, batch_size, duration_ms, failed, id, metadata, queue_name, recorded_at, requeued, skipped, successful, worker_id").range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list google_sync_worker_metrics.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromGoogleSyncWorkerMetricsRow(row))
    return { rows }
  }

  async insert(data: Partial<GoogleSyncWorkerMetricsDTO>): Promise<GoogleSyncWorkerMetricsDTO> {
    const payload = toGoogleSyncWorkerMetricsInsert(data)
    const { data: row, error } = await this.supabase
      .from("google_sync_worker_metrics")
      .insert(payload)
      .select("backlog_after, batch_size, duration_ms, failed, id, metadata, queue_name, recorded_at, requeued, skipped, successful, worker_id")
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert google_sync_worker_metrics.", { cause: error })
    }
    return fromGoogleSyncWorkerMetricsRow(row)
  }

  async update(id: string, patch: Partial<GoogleSyncWorkerMetricsDTO>): Promise<GoogleSyncWorkerMetricsDTO> {
    const payload = toGoogleSyncWorkerMetricsUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("google_sync_worker_metrics")
      .update(payload)
      .eq("id", id)
      .select("backlog_after, batch_size, duration_ms, failed, id, metadata, queue_name, recorded_at, requeued, skipped, successful, worker_id")
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update google_sync_worker_metrics.", { cause: error })
    }
    return fromGoogleSyncWorkerMetricsRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("google_sync_worker_metrics").delete().eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete google_sync_worker_metrics.", { cause: error })
    }
  }

}

export { GoogleSyncWorkerMetricsSupabaseRepository }
