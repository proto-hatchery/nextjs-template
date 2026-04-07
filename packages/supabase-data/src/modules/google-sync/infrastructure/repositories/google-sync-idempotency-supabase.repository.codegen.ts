// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"

import type { GoogleSyncIdempotencyRepository, GoogleSyncIdempotencyListParams, GoogleSyncIdempotencyListResult } from "@workspace/supabase-data/modules/google-sync/domain/ports/google-sync-idempotency-repository.port.codegen"
import { fromGoogleSyncIdempotencyRow, toGoogleSyncIdempotencyInsert, toGoogleSyncIdempotencyUpdate } from "@workspace/supabase-data/modules/google-sync/infrastructure/mappers/google-sync-idempotency.mapper.codegen"
import type { GoogleSyncIdempotencyDTO } from "@workspace/supabase-data/modules/google-sync/domain/dto/google-sync-idempotency.dto.codegen"

class GoogleSyncIdempotencySupabaseRepository implements GoogleSyncIdempotencyRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async list(params: GoogleSyncIdempotencyListParams): Promise<GoogleSyncIdempotencyListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase.from("google_sync_idempotency").select("calendar_event_id, completed_at, created_at, error_message, expires_at, idempotency_key, operation, psychologist_id, request_data, response_data, status, updated_at").range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list google_sync_idempotency.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromGoogleSyncIdempotencyRow(row))
    return { rows }
  }

  async insert(data: Partial<GoogleSyncIdempotencyDTO>): Promise<GoogleSyncIdempotencyDTO> {
    const payload = toGoogleSyncIdempotencyInsert(data)
    const { data: row, error } = await this.supabase
      .from("google_sync_idempotency")
      .insert(payload)
      .select("calendar_event_id, completed_at, created_at, error_message, expires_at, idempotency_key, operation, psychologist_id, request_data, response_data, status, updated_at")
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert google_sync_idempotency.", { cause: error })
    }
    return fromGoogleSyncIdempotencyRow(row)
  }

  async update(id: string, patch: Partial<GoogleSyncIdempotencyDTO>): Promise<GoogleSyncIdempotencyDTO> {
    const payload = toGoogleSyncIdempotencyUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("google_sync_idempotency")
      .update(payload)
      .eq("id", id)
      .select("calendar_event_id, completed_at, created_at, error_message, expires_at, idempotency_key, operation, psychologist_id, request_data, response_data, status, updated_at")
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update google_sync_idempotency.", { cause: error })
    }
    return fromGoogleSyncIdempotencyRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("google_sync_idempotency").delete().eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete google_sync_idempotency.", { cause: error })
    }
  }

}

export { GoogleSyncIdempotencySupabaseRepository }
