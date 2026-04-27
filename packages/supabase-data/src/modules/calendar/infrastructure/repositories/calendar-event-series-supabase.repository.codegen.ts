// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { CalendarEventSeriesDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-event-series.dto.codegen"
import type {
  CalendarEventSeriesRepository,
  CalendarEventSeriesListParams,
  CalendarEventSeriesListResult,
} from "@workspace/supabase-data/modules/calendar/domain/ports/calendar-event-series-repository.port.codegen"
import {
  fromCalendarEventSeriesRow,
  toCalendarEventSeriesInsert,
  toCalendarEventSeriesUpdate,
} from "@workspace/supabase-data/modules/calendar/infrastructure/mappers/calendar-event-series.mapper.codegen"

class CalendarEventSeriesSupabaseRepository implements CalendarEventSeriesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<CalendarEventSeriesDTO | null> {
    const { data, error } = await this.supabase
      .from("calendar_event_series")
      .select(
        "all_day, color, created_at, description, duration_minutes, effective_end, effective_start, end_time, event_type, google_event_id, google_sync_status, id, location, metadata, psychologist_id, rrule, start_time, timezone, title, updated_at"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load calendar_event_series.", { cause: error })
    }
    if (!data) return null
    return fromCalendarEventSeriesRow(data)
  }

  async list(params: CalendarEventSeriesListParams): Promise<CalendarEventSeriesListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("calendar_event_series")
      .select(
        "all_day, color, created_at, description, duration_minutes, effective_end, effective_start, end_time, event_type, google_event_id, google_sync_status, id, location, metadata, psychologist_id, rrule, start_time, timezone, title, updated_at"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list calendar_event_series.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromCalendarEventSeriesRow(row))
    return { rows }
  }

  async insert(data: Partial<CalendarEventSeriesDTO>): Promise<CalendarEventSeriesDTO> {
    const payload = toCalendarEventSeriesInsert(data)
    const { data: row, error } = await this.supabase
      .from("calendar_event_series")
      .insert(payload)
      .select(
        "all_day, color, created_at, description, duration_minutes, effective_end, effective_start, end_time, event_type, google_event_id, google_sync_status, id, location, metadata, psychologist_id, rrule, start_time, timezone, title, updated_at"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert calendar_event_series.", { cause: error })
    }
    return fromCalendarEventSeriesRow(row)
  }

  async update(
    id: string,
    patch: Partial<CalendarEventSeriesDTO>
  ): Promise<CalendarEventSeriesDTO> {
    const payload = toCalendarEventSeriesUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("calendar_event_series")
      .update(payload)
      .eq("id", id)
      .select(
        "all_day, color, created_at, description, duration_minutes, effective_end, effective_start, end_time, event_type, google_event_id, google_sync_status, id, location, metadata, psychologist_id, rrule, start_time, timezone, title, updated_at"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update calendar_event_series.", { cause: error })
    }
    return fromCalendarEventSeriesRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("calendar_event_series").delete().eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete calendar_event_series.", { cause: error })
    }
  }
}

export { CalendarEventSeriesSupabaseRepository }
