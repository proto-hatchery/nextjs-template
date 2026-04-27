// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { CalendarEventsDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-events.dto.codegen"

export interface CalendarEventsListParams {
  limit?: number
  offset?: number
}

export interface CalendarEventsListResult {
  rows: CalendarEventsDTO[]
}

interface CalendarEventsRepository {
  findById(id: string): Promise<CalendarEventsDTO | null>
  list(params: CalendarEventsListParams): Promise<CalendarEventsListResult>
  insert(data: Partial<CalendarEventsDTO>): Promise<CalendarEventsDTO>
  update(id: string, patch: Partial<CalendarEventsDTO>): Promise<CalendarEventsDTO>
  delete(id: string): Promise<void>
}

export { type CalendarEventsRepository }
