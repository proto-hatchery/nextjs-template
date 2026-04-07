// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"

import type { GoogleSyncLogsRepository, GoogleSyncLogsListParams, GoogleSyncLogsListResult } from "@workspace/supabase-data/modules/google-sync/domain/ports/google-sync-logs-repository.port.codegen"
import { fromGoogleSyncLogsRow, toGoogleSyncLogsInsert, toGoogleSyncLogsUpdate } from "@workspace/supabase-data/modules/google-sync/infrastructure/mappers/google-sync-logs.mapper.codegen"
import type { GoogleSyncLogsDTO } from "@workspace/supabase-data/modules/google-sync/domain/dto/google-sync-logs.dto.codegen"

class GoogleSyncLogsSupabaseRepository implements GoogleSyncLogsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<GoogleSyncLogsDTO | null> {
    const { data, error } = await this.supabase
      .from("google_sync_logs")
      .select("calendar_event_id, completed_at, created_at, error_code, error_message, google_event_id, id, operation, psychologist_id, request_payload, response_payload, series_id, started_at, status, sync_direction")
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load google_sync_logs.", { cause: error })
    }
    if (!data) return null
    return fromGoogleSyncLogsRow(data)
  }

  async list(params: GoogleSyncLogsListParams): Promise<GoogleSyncLogsListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase.from("google_sync_logs").select("calendar_event_id, completed_at, created_at, error_code, error_message, google_event_id, id, operation, psychologist_id, request_payload, response_payload, series_id, started_at, status, sync_direction").range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list google_sync_logs.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromGoogleSyncLogsRow(row))
    return { rows }
  }

  async insert(data: Partial<GoogleSyncLogsDTO>): Promise<GoogleSyncLogsDTO> {
    const payload = toGoogleSyncLogsInsert(data)
    const { data: row, error } = await this.supabase
      .from("google_sync_logs")
      .insert(payload)
      .select("calendar_event_id, completed_at, created_at, error_code, error_message, google_event_id, id, operation, psychologist_id, request_payload, response_payload, series_id, started_at, status, sync_direction")
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert google_sync_logs.", { cause: error })
    }
    return fromGoogleSyncLogsRow(row)
  }

  async update(id: string, patch: Partial<GoogleSyncLogsDTO>): Promise<GoogleSyncLogsDTO> {
    const payload = toGoogleSyncLogsUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("google_sync_logs")
      .update(payload)
      .eq("id", id)
      .select("calendar_event_id, completed_at, created_at, error_code, error_message, google_event_id, id, operation, psychologist_id, request_payload, response_payload, series_id, started_at, status, sync_direction")
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update google_sync_logs.", { cause: error })
    }
    return fromGoogleSyncLogsRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("google_sync_logs").delete().eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete google_sync_logs.", { cause: error })
    }
  }

}

export { GoogleSyncLogsSupabaseRepository }
