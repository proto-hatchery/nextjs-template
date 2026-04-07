// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { Database } from "@workspace/supabase-infra/types/database"

import { CalendarHolidaysDTOSchema, type CalendarHolidaysDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-holidays.dto.codegen"

type CalendarHolidaysRow = Database["public"]["Tables"]["calendar_holidays"]["Row"]
type CalendarHolidaysInsert = Database["public"]["Tables"]["calendar_holidays"]["Insert"]
type CalendarHolidaysUpdate = Database["public"]["Tables"]["calendar_holidays"]["Update"]

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

type CalendarHolidaysField = keyof typeof CalendarHolidaysFieldMappings

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

function toCalendarHolidaysInsert(dto: Partial<CalendarHolidaysDTO>): CalendarHolidaysInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(CalendarHolidaysFieldMappings) as Array<
    [CalendarHolidaysField, (typeof CalendarHolidaysFieldMappings)[CalendarHolidaysField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as CalendarHolidaysInsert
}

function toCalendarHolidaysUpdate(dto: Partial<CalendarHolidaysDTO>): CalendarHolidaysUpdate {
  return toCalendarHolidaysInsert(dto) as CalendarHolidaysUpdate
}

export { fromCalendarHolidaysRow, toCalendarHolidaysInsert, toCalendarHolidaysUpdate }
