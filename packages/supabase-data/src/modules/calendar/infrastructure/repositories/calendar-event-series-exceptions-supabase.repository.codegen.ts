// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { CalendarEventSeriesExceptionsDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-event-series-exceptions.dto.codegen"
import type {
  CalendarEventSeriesExceptionsRepository,
  CalendarEventSeriesExceptionsListParams,
  CalendarEventSeriesExceptionsListResult,
} from "@workspace/supabase-data/modules/calendar/domain/ports/calendar-event-series-exceptions-repository.port.codegen"
import {
  fromCalendarEventSeriesExceptionsRow,
  toCalendarEventSeriesExceptionsInsert,
  toCalendarEventSeriesExceptionsUpdate,
} from "@workspace/supabase-data/modules/calendar/infrastructure/mappers/calendar-event-series-exceptions.mapper.codegen"

class CalendarEventSeriesExceptionsSupabaseRepository implements CalendarEventSeriesExceptionsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<CalendarEventSeriesExceptionsDTO | null> {
    const { data, error } = await this.supabase
      .from("calendar_event_series_exceptions")
      .select(
        "created_at, exception_type, id, modified_fields, new_end_datetime, new_start_datetime, original_date, reason, series_id"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load calendar_event_series_exceptions.", {
        cause: error,
      })
    }
    if (!data) return null
    return fromCalendarEventSeriesExceptionsRow(data)
  }

  async list(
    params: CalendarEventSeriesExceptionsListParams
  ): Promise<CalendarEventSeriesExceptionsListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("calendar_event_series_exceptions")
      .select(
        "created_at, exception_type, id, modified_fields, new_end_datetime, new_start_datetime, original_date, reason, series_id"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list calendar_event_series_exceptions.", {
        cause: error,
      })
    }
    const rows = (data ?? []).map((row) => fromCalendarEventSeriesExceptionsRow(row))
    return { rows }
  }

  async insert(
    data: Partial<CalendarEventSeriesExceptionsDTO>
  ): Promise<CalendarEventSeriesExceptionsDTO> {
    const payload = toCalendarEventSeriesExceptionsInsert(data)
    const { data: row, error } = await this.supabase
      .from("calendar_event_series_exceptions")
      .insert(payload)
      .select(
        "created_at, exception_type, id, modified_fields, new_end_datetime, new_start_datetime, original_date, reason, series_id"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert calendar_event_series_exceptions.", {
        cause: error,
      })
    }
    return fromCalendarEventSeriesExceptionsRow(row)
  }

  async update(
    id: string,
    patch: Partial<CalendarEventSeriesExceptionsDTO>
  ): Promise<CalendarEventSeriesExceptionsDTO> {
    const payload = toCalendarEventSeriesExceptionsUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("calendar_event_series_exceptions")
      .update(payload)
      .eq("id", id)
      .select(
        "created_at, exception_type, id, modified_fields, new_end_datetime, new_start_datetime, original_date, reason, series_id"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update calendar_event_series_exceptions.", {
        cause: error,
      })
    }
    return fromCalendarEventSeriesExceptionsRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("calendar_event_series_exceptions")
      .delete()
      .eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete calendar_event_series_exceptions.", {
        cause: error,
      })
    }
  }
}

export { CalendarEventSeriesExceptionsSupabaseRepository }
