// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { CalendarEventSeriesExceptionsDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-event-series-exceptions.dto.codegen"

export interface CalendarEventSeriesExceptionsListParams {
  limit?: number
  offset?: number
}

export interface CalendarEventSeriesExceptionsListResult {
  rows: CalendarEventSeriesExceptionsDTO[]
}

interface CalendarEventSeriesExceptionsRepository {
  findById(id: string): Promise<CalendarEventSeriesExceptionsDTO | null>
  list(
    params: CalendarEventSeriesExceptionsListParams
  ): Promise<CalendarEventSeriesExceptionsListResult>
  insert(data: Partial<CalendarEventSeriesExceptionsDTO>): Promise<CalendarEventSeriesExceptionsDTO>
  update(
    id: string,
    patch: Partial<CalendarEventSeriesExceptionsDTO>
  ): Promise<CalendarEventSeriesExceptionsDTO>
  delete(id: string): Promise<void>
}

export { type CalendarEventSeriesExceptionsRepository }
