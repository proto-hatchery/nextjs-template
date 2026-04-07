// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"

import type { CalendarChangeLogRepository, CalendarChangeLogListParams, CalendarChangeLogListResult } from "@workspace/supabase-data/modules/calendar/domain/ports/calendar-change-log-repository.port.codegen"
import { fromCalendarChangeLogRow, toCalendarChangeLogInsert, toCalendarChangeLogUpdate } from "@workspace/supabase-data/modules/calendar/infrastructure/mappers/calendar-change-log.mapper.codegen"
import type { CalendarChangeLogDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-change-log.dto.codegen"

class CalendarChangeLogSupabaseRepository implements CalendarChangeLogRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<CalendarChangeLogDTO | null> {
    const { data, error } = await this.supabase
      .from("calendar_change_log")
      .select("created_at, google_event_id, id, modification_hash, processed_at, psychologist_id, sync_direction")
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load calendar_change_log.", { cause: error })
    }
    if (!data) return null
    return fromCalendarChangeLogRow(data)
  }

  async list(params: CalendarChangeLogListParams): Promise<CalendarChangeLogListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase.from("calendar_change_log").select("created_at, google_event_id, id, modification_hash, processed_at, psychologist_id, sync_direction").range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list calendar_change_log.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromCalendarChangeLogRow(row))
    return { rows }
  }

  async insert(data: Partial<CalendarChangeLogDTO>): Promise<CalendarChangeLogDTO> {
    const payload = toCalendarChangeLogInsert(data)
    const { data: row, error } = await this.supabase
      .from("calendar_change_log")
      .insert(payload)
      .select("created_at, google_event_id, id, modification_hash, processed_at, psychologist_id, sync_direction")
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert calendar_change_log.", { cause: error })
    }
    return fromCalendarChangeLogRow(row)
  }

  async update(id: string, patch: Partial<CalendarChangeLogDTO>): Promise<CalendarChangeLogDTO> {
    const payload = toCalendarChangeLogUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("calendar_change_log")
      .update(payload)
      .eq("id", id)
      .select("created_at, google_event_id, id, modification_hash, processed_at, psychologist_id, sync_direction")
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update calendar_change_log.", { cause: error })
    }
    return fromCalendarChangeLogRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("calendar_change_log").delete().eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete calendar_change_log.", { cause: error })
    }
  }

}

export { CalendarChangeLogSupabaseRepository }
