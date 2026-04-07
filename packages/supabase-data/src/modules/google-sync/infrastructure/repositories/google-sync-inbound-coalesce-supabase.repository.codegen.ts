// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"

import type { GoogleSyncInboundCoalesceRepository, GoogleSyncInboundCoalesceListParams, GoogleSyncInboundCoalesceListResult } from "@workspace/supabase-data/modules/google-sync/domain/ports/google-sync-inbound-coalesce-repository.port.codegen"
import { fromGoogleSyncInboundCoalesceRow, toGoogleSyncInboundCoalesceInsert, toGoogleSyncInboundCoalesceUpdate } from "@workspace/supabase-data/modules/google-sync/infrastructure/mappers/google-sync-inbound-coalesce.mapper.codegen"
import type { GoogleSyncInboundCoalesceDTO } from "@workspace/supabase-data/modules/google-sync/domain/dto/google-sync-inbound-coalesce.dto.codegen"

class GoogleSyncInboundCoalesceSupabaseRepository implements GoogleSyncInboundCoalesceRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async list(params: GoogleSyncInboundCoalesceListParams): Promise<GoogleSyncInboundCoalesceListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase.from("google_sync_inbound_coalesce").select("connection_id, created_at, last_enqueued_at, msg_id").range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list google_sync_inbound_coalesce.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromGoogleSyncInboundCoalesceRow(row))
    return { rows }
  }

  async insert(data: Partial<GoogleSyncInboundCoalesceDTO>): Promise<GoogleSyncInboundCoalesceDTO> {
    const payload = toGoogleSyncInboundCoalesceInsert(data)
    const { data: row, error } = await this.supabase
      .from("google_sync_inbound_coalesce")
      .insert(payload)
      .select("connection_id, created_at, last_enqueued_at, msg_id")
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert google_sync_inbound_coalesce.", { cause: error })
    }
    return fromGoogleSyncInboundCoalesceRow(row)
  }

  async update(id: string, patch: Partial<GoogleSyncInboundCoalesceDTO>): Promise<GoogleSyncInboundCoalesceDTO> {
    const payload = toGoogleSyncInboundCoalesceUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("google_sync_inbound_coalesce")
      .update(payload)
      .eq("id", id)
      .select("connection_id, created_at, last_enqueued_at, msg_id")
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update google_sync_inbound_coalesce.", { cause: error })
    }
    return fromGoogleSyncInboundCoalesceRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("google_sync_inbound_coalesce").delete().eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete google_sync_inbound_coalesce.", { cause: error })
    }
  }

}

export { GoogleSyncInboundCoalesceSupabaseRepository }
