// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { CalendarHolidaysDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-holidays.dto.codegen"

export interface CalendarHolidaysListParams {
  limit?: number
  offset?: number
}

export interface CalendarHolidaysListResult {
  rows: CalendarHolidaysDTO[]
}

interface CalendarHolidaysRepository {
  findById(id: string): Promise<CalendarHolidaysDTO | null>
  list(params: CalendarHolidaysListParams): Promise<CalendarHolidaysListResult>
}

export { type CalendarHolidaysRepository }
