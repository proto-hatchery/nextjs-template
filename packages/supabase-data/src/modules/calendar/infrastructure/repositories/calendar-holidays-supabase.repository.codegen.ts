// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { CalendarHolidaysDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-holidays.dto.codegen"
import type {
  CalendarHolidaysRepository,
  CalendarHolidaysListParams,
  CalendarHolidaysListResult,
} from "@workspace/supabase-data/modules/calendar/domain/ports/calendar-holidays-repository.port.codegen"
import { fromCalendarHolidaysRow } from "@workspace/supabase-data/modules/calendar/infrastructure/mappers/calendar-holidays.mapper.codegen"

class CalendarHolidaysSupabaseRepository implements CalendarHolidaysRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<CalendarHolidaysDTO | null> {
    const { data, error } = await this.supabase
      .from("calendar_holidays")
      .select(
        "city, created_at, date, description, id, name, source, state, type, updated_at, year"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load calendar_holidays.", { cause: error })
    }
    if (!data) return null
    return fromCalendarHolidaysRow(data)
  }

  async list(params: CalendarHolidaysListParams): Promise<CalendarHolidaysListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("calendar_holidays")
      .select(
        "city, created_at, date, description, id, name, source, state, type, updated_at, year"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list calendar_holidays.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromCalendarHolidaysRow(row))
    return { rows }
  }
}

export { CalendarHolidaysSupabaseRepository }
