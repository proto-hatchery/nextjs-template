// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"

import type { GoogleSyncJobDedupRepository, GoogleSyncJobDedupListParams, GoogleSyncJobDedupListResult } from "@workspace/supabase-data/modules/google-sync/domain/ports/google-sync-job-dedup-repository.port.codegen"
import { fromGoogleSyncJobDedupRow, toGoogleSyncJobDedupInsert, toGoogleSyncJobDedupUpdate } from "@workspace/supabase-data/modules/google-sync/infrastructure/mappers/google-sync-job-dedup.mapper.codegen"
import type { GoogleSyncJobDedupDTO } from "@workspace/supabase-data/modules/google-sync/domain/dto/google-sync-job-dedup.dto.codegen"

class GoogleSyncJobDedupSupabaseRepository implements GoogleSyncJobDedupRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async list(params: GoogleSyncJobDedupListParams): Promise<GoogleSyncJobDedupListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase.from("google_sync_job_dedup").select("idempotency_key, outcome, processed_at").range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list google_sync_job_dedup.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromGoogleSyncJobDedupRow(row))
    return { rows }
  }

  async insert(data: Partial<GoogleSyncJobDedupDTO>): Promise<GoogleSyncJobDedupDTO> {
    const payload = toGoogleSyncJobDedupInsert(data)
    const { data: row, error } = await this.supabase
      .from("google_sync_job_dedup")
      .insert(payload)
      .select("idempotency_key, outcome, processed_at")
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert google_sync_job_dedup.", { cause: error })
    }
    return fromGoogleSyncJobDedupRow(row)
  }

  async update(id: string, patch: Partial<GoogleSyncJobDedupDTO>): Promise<GoogleSyncJobDedupDTO> {
    const payload = toGoogleSyncJobDedupUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("google_sync_job_dedup")
      .update(payload)
      .eq("id", id)
      .select("idempotency_key, outcome, processed_at")
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update google_sync_job_dedup.", { cause: error })
    }
    return fromGoogleSyncJobDedupRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("google_sync_job_dedup").delete().eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete google_sync_job_dedup.", { cause: error })
    }
  }

}

export { GoogleSyncJobDedupSupabaseRepository }
