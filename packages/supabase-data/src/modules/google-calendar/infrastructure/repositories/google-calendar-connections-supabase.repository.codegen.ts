// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { GoogleCalendarConnectionsDTO } from "@workspace/supabase-data/modules/google-calendar/domain/dto/google-calendar-connections.dto.codegen"
import type {
  GoogleCalendarConnectionsRepository,
  GoogleCalendarConnectionsListParams,
  GoogleCalendarConnectionsListResult,
} from "@workspace/supabase-data/modules/google-calendar/domain/ports/google-calendar-connections-repository.port.codegen"
import {
  fromGoogleCalendarConnectionsRow,
  toGoogleCalendarConnectionsInsert,
  toGoogleCalendarConnectionsUpdate,
} from "@workspace/supabase-data/modules/google-calendar/infrastructure/mappers/google-calendar-connections.mapper.codegen"

class GoogleCalendarConnectionsSupabaseRepository implements GoogleCalendarConnectionsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<GoogleCalendarConnectionsDTO | null> {
    const { data, error } = await this.supabase
      .from("google_calendar_connections")
      .select(
        "access_token, access_token_encrypted, auto_create_meet_for_sessions, consecutive_errors, created_at, google_calendar_id, google_email, id, is_connected, last_full_sync_at, last_incremental_sync_at, last_successful_sync_at, last_sync_at, last_sync_error, last_sync_error_code, last_watch_renewal_at, last_webhook_at, psychologist_id, refresh_error_count, refresh_token, refresh_token_encrypted, show_event_details, show_patient_name, sync_blocks, sync_enabled, sync_from_google, sync_meetings, sync_other, sync_sessions, sync_state, sync_supervisions, sync_tasks, sync_to_google, sync_token, sync_token_updated_at, token_expires_at, updated_at, watch_channel_id, watch_channel_token, watch_expiration, watch_expires_at, watch_resource_id"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load google_calendar_connections.", {
        cause: error,
      })
    }
    if (!data) return null
    return fromGoogleCalendarConnectionsRow(data)
  }

  async list(
    params: GoogleCalendarConnectionsListParams
  ): Promise<GoogleCalendarConnectionsListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("google_calendar_connections")
      .select(
        "access_token, access_token_encrypted, auto_create_meet_for_sessions, consecutive_errors, created_at, google_calendar_id, google_email, id, is_connected, last_full_sync_at, last_incremental_sync_at, last_successful_sync_at, last_sync_at, last_sync_error, last_sync_error_code, last_watch_renewal_at, last_webhook_at, psychologist_id, refresh_error_count, refresh_token, refresh_token_encrypted, show_event_details, show_patient_name, sync_blocks, sync_enabled, sync_from_google, sync_meetings, sync_other, sync_sessions, sync_state, sync_supervisions, sync_tasks, sync_to_google, sync_token, sync_token_updated_at, token_expires_at, updated_at, watch_channel_id, watch_channel_token, watch_expiration, watch_expires_at, watch_resource_id"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list google_calendar_connections.", {
        cause: error,
      })
    }
    const rows = (data ?? []).map((row) => fromGoogleCalendarConnectionsRow(row))
    return { rows }
  }

  async insert(data: Partial<GoogleCalendarConnectionsDTO>): Promise<GoogleCalendarConnectionsDTO> {
    const payload = toGoogleCalendarConnectionsInsert(data)
    const { data: row, error } = await this.supabase
      .from("google_calendar_connections")
      .insert(payload)
      .select(
        "access_token, access_token_encrypted, auto_create_meet_for_sessions, consecutive_errors, created_at, google_calendar_id, google_email, id, is_connected, last_full_sync_at, last_incremental_sync_at, last_successful_sync_at, last_sync_at, last_sync_error, last_sync_error_code, last_watch_renewal_at, last_webhook_at, psychologist_id, refresh_error_count, refresh_token, refresh_token_encrypted, show_event_details, show_patient_name, sync_blocks, sync_enabled, sync_from_google, sync_meetings, sync_other, sync_sessions, sync_state, sync_supervisions, sync_tasks, sync_to_google, sync_token, sync_token_updated_at, token_expires_at, updated_at, watch_channel_id, watch_channel_token, watch_expiration, watch_expires_at, watch_resource_id"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert google_calendar_connections.", {
        cause: error,
      })
    }
    return fromGoogleCalendarConnectionsRow(row)
  }

  async update(
    id: string,
    patch: Partial<GoogleCalendarConnectionsDTO>
  ): Promise<GoogleCalendarConnectionsDTO> {
    const payload = toGoogleCalendarConnectionsUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("google_calendar_connections")
      .update(payload)
      .eq("id", id)
      .select(
        "access_token, access_token_encrypted, auto_create_meet_for_sessions, consecutive_errors, created_at, google_calendar_id, google_email, id, is_connected, last_full_sync_at, last_incremental_sync_at, last_successful_sync_at, last_sync_at, last_sync_error, last_sync_error_code, last_watch_renewal_at, last_webhook_at, psychologist_id, refresh_error_count, refresh_token, refresh_token_encrypted, show_event_details, show_patient_name, sync_blocks, sync_enabled, sync_from_google, sync_meetings, sync_other, sync_sessions, sync_state, sync_supervisions, sync_tasks, sync_to_google, sync_token, sync_token_updated_at, token_expires_at, updated_at, watch_channel_id, watch_channel_token, watch_expiration, watch_expires_at, watch_resource_id"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update google_calendar_connections.", {
        cause: error,
      })
    }
    return fromGoogleCalendarConnectionsRow(row)
  }
}

export { GoogleCalendarConnectionsSupabaseRepository }
