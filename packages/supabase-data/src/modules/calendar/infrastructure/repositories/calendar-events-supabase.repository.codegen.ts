// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { CalendarEventsDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-events.dto.codegen"
import type {
  CalendarEventsRepository,
  CalendarEventsListParams,
  CalendarEventsListResult,
} from "@workspace/supabase-data/modules/calendar/domain/ports/calendar-events-repository.port.codegen"
import {
  fromCalendarEventsRow,
  toCalendarEventsInsert,
  toCalendarEventsUpdate,
} from "@workspace/supabase-data/modules/calendar/infrastructure/mappers/calendar-events.mapper.codegen"

class CalendarEventsSupabaseRepository implements CalendarEventsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<CalendarEventsDTO | null> {
    const { data, error } = await this.supabase
      .from("calendar_events_full")
      .select(
        "all_day, attendance_confirmed, billing_status, clinical_session_id, color, created_at, description, duration_minutes, end_datetime, event_type, google_event_id, google_sync_error, google_sync_status, id, last_synced_at, location, metadata, original_end_datetime, original_start_datetime, patient_display_name, patient_name, private_notes, psychologist_id, psychologist_patient_id, psychologist_service_id, series_id, service_duration, service_name, service_price, session_number, source, start_datetime, status, timezone, title, updated_at"
      )
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
    const q = this.supabase
      .from("calendar_events_full")
      .select(
        "all_day, attendance_confirmed, billing_status, clinical_session_id, color, created_at, description, duration_minutes, end_datetime, event_type, google_event_id, google_sync_error, google_sync_status, id, last_synced_at, location, metadata, original_end_datetime, original_start_datetime, patient_display_name, patient_name, private_notes, psychologist_id, psychologist_patient_id, psychologist_service_id, series_id, service_duration, service_name, service_price, session_number, source, start_datetime, status, timezone, title, updated_at"
      )
      .range(offset, end)
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
      .select(
        "all_day, attendance_confirmed, billing_status, clinical_session_id, color, created_at, description, duration_minutes, end_datetime, event_type, google_event_id, google_sync_error, google_sync_status, id, last_synced_at, location, metadata, original_end_datetime, original_start_datetime, patient_display_name, patient_name, private_notes, psychologist_id, psychologist_patient_id, psychologist_service_id, series_id, service_duration, service_name, service_price, session_number, source, start_datetime, status, timezone, title, updated_at"
      )
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
      .select(
        "all_day, attendance_confirmed, billing_status, clinical_session_id, color, created_at, description, duration_minutes, end_datetime, event_type, google_event_id, google_sync_error, google_sync_status, id, last_synced_at, location, metadata, original_end_datetime, original_start_datetime, patient_display_name, patient_name, private_notes, psychologist_id, psychologist_patient_id, psychologist_service_id, series_id, service_duration, service_name, service_price, session_number, source, start_datetime, status, timezone, title, updated_at"
      )
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
