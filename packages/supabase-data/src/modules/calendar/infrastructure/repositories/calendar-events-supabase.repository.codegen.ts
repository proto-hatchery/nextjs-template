// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"

import type { CalendarEventsRepository, CalendarEventsListParams, CalendarEventsListResult } from "@workspace/supabase-data/modules/calendar/domain/ports/calendar-events-repository.port.codegen"
import { fromCalendarEventsRow, toCalendarEventsInsert, toCalendarEventsUpdate } from "@workspace/supabase-data/modules/calendar/infrastructure/mappers/calendar-events.mapper.codegen"
import type { CalendarEventsDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-events.dto.codegen"

class CalendarEventsSupabaseRepository implements CalendarEventsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<CalendarEventsDTO | null> {
    const { data, error } = await this.supabase
      .from("calendar_events")
      .select("all_day, color, created_at, description, duration_minutes, end_datetime, event_type, google_event_id, google_original_start_time, google_recurring_event_id, google_sync_error, google_sync_status, id, last_synced_at, location, metadata, original_end_datetime, original_start_datetime, private_notes, psychologist_id, remote_etag, remote_updated_at, series_id, source, start_datetime, status, sync_origin, timezone, title, updated_at")
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load calendar_events.", { cause: error })
    }
    if (!data) return null
    return fromCalendarEventsRow(data)
  }

  async list(params: CalendarEventsListParams): Promise<CalendarEventsListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase.from("calendar_events").select("all_day, color, created_at, description, duration_minutes, end_datetime, event_type, google_event_id, google_original_start_time, google_recurring_event_id, google_sync_error, google_sync_status, id, last_synced_at, location, metadata, original_end_datetime, original_start_datetime, private_notes, psychologist_id, remote_etag, remote_updated_at, series_id, source, start_datetime, status, sync_origin, timezone, title, updated_at").range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list calendar_events.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromCalendarEventsRow(row))
    return { rows }
  }

  async insert(data: Partial<CalendarEventsDTO>): Promise<CalendarEventsDTO> {
    const payload = toCalendarEventsInsert(data)
    const { data: row, error } = await this.supabase
      .from("calendar_events")
      .insert(payload)
      .select("all_day, color, created_at, description, duration_minutes, end_datetime, event_type, google_event_id, google_original_start_time, google_recurring_event_id, google_sync_error, google_sync_status, id, last_synced_at, location, metadata, original_end_datetime, original_start_datetime, private_notes, psychologist_id, remote_etag, remote_updated_at, series_id, source, start_datetime, status, sync_origin, timezone, title, updated_at")
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert calendar_events.", { cause: error })
    }
    return fromCalendarEventsRow(row)
  }

  async update(id: string, patch: Partial<CalendarEventsDTO>): Promise<CalendarEventsDTO> {
    const payload = toCalendarEventsUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("calendar_events")
      .update(payload)
      .eq("id", id)
      .select("all_day, color, created_at, description, duration_minutes, end_datetime, event_type, google_event_id, google_original_start_time, google_recurring_event_id, google_sync_error, google_sync_status, id, last_synced_at, location, metadata, original_end_datetime, original_start_datetime, private_notes, psychologist_id, remote_etag, remote_updated_at, series_id, source, start_datetime, status, sync_origin, timezone, title, updated_at")
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update calendar_events.", { cause: error })
    }
    return fromCalendarEventsRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("calendar_events").delete().eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete calendar_events.", { cause: error })
    }
  }

}

export { CalendarEventsSupabaseRepository }
