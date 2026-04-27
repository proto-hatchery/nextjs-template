// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { CalendarEventSeriesDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-event-series.dto.codegen"

export interface CalendarEventSeriesListParams {
  limit?: number
  offset?: number
}

export interface CalendarEventSeriesListResult {
  rows: CalendarEventSeriesDTO[]
}

interface CalendarEventSeriesRepository {
  findById(id: string): Promise<CalendarEventSeriesDTO | null>
  list(params: CalendarEventSeriesListParams): Promise<CalendarEventSeriesListResult>
  insert(data: Partial<CalendarEventSeriesDTO>): Promise<CalendarEventSeriesDTO>
  update(id: string, patch: Partial<CalendarEventSeriesDTO>): Promise<CalendarEventSeriesDTO>
  delete(id: string): Promise<void>
}

export { type CalendarEventSeriesRepository }
