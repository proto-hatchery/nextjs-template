// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  CalendarHolidaysDTOSchema,
  type CalendarHolidaysDTO,
} from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-holidays.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type CalendarHolidaysRow = Database["public"]["Tables"]["calendar_holidays"]["Row"]

const CalendarHolidaysFieldMappings = {
  city: "city",
  createdAt: "created_at",
  date: "date",
  description: "description",
  id: "id",
  name: "name",
  source: "source",
  state: "state",
  type: "type",
  updatedAt: "updated_at",
  year: "year",
} as const

type _CalendarHolidaysField = keyof typeof CalendarHolidaysFieldMappings

function fromCalendarHolidaysRow(row: CalendarHolidaysRow): CalendarHolidaysDTO {
  const mapped = {
    city: row.city,
    createdAt: row.created_at,
    date: row.date,
    description: row.description,
    id: row.id,
    name: row.name,
    source: row.source,
    state: row.state,
    type: row.type,
    updatedAt: row.updated_at,
    year: row.year,
  }
  return CalendarHolidaysDTOSchema.parse(mapped)
}

export { fromCalendarHolidaysRow }
