// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  CalendarEventSeriesExceptionsDTOSchema,
  type CalendarEventSeriesExceptionsDTO,
} from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-event-series-exceptions.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type CalendarEventSeriesExceptionsRow =
  Database["public"]["Tables"]["calendar_event_series_exceptions"]["Row"]
type CalendarEventSeriesExceptionsInsert =
  Database["public"]["Tables"]["calendar_event_series_exceptions"]["Insert"]
type CalendarEventSeriesExceptionsUpdate =
  Database["public"]["Tables"]["calendar_event_series_exceptions"]["Update"]

const CalendarEventSeriesExceptionsFieldMappings = {
  createdAt: "created_at",
  exceptionType: "exception_type",
  id: "id",
  modifiedFields: "modified_fields",
  newEndDatetime: "new_end_datetime",
  newStartDatetime: "new_start_datetime",
  originalDate: "original_date",
  reason: "reason",
  seriesId: "series_id",
} as const

type CalendarEventSeriesExceptionsField = keyof typeof CalendarEventSeriesExceptionsFieldMappings

function fromCalendarEventSeriesExceptionsRow(
  row: CalendarEventSeriesExceptionsRow
): CalendarEventSeriesExceptionsDTO {
  const mapped = {
    createdAt: row.created_at,
    exceptionType: row.exception_type,
    id: row.id,
    modifiedFields: row.modified_fields,
    newEndDatetime: row.new_end_datetime,
    newStartDatetime: row.new_start_datetime,
    originalDate: row.original_date,
    reason: row.reason,
    seriesId: row.series_id,
  }
  return CalendarEventSeriesExceptionsDTOSchema.parse(mapped)
}

function toCalendarEventSeriesExceptionsInsert(
  dto: Partial<CalendarEventSeriesExceptionsDTO>
): CalendarEventSeriesExceptionsInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(
    CalendarEventSeriesExceptionsFieldMappings
  ) as Array<
    [
      CalendarEventSeriesExceptionsField,
      (typeof CalendarEventSeriesExceptionsFieldMappings)[CalendarEventSeriesExceptionsField],
    ]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as CalendarEventSeriesExceptionsInsert
}

function toCalendarEventSeriesExceptionsUpdate(
  dto: Partial<CalendarEventSeriesExceptionsDTO>
): CalendarEventSeriesExceptionsUpdate {
  return toCalendarEventSeriesExceptionsInsert(dto) as CalendarEventSeriesExceptionsUpdate
}

export {
  fromCalendarEventSeriesExceptionsRow,
  toCalendarEventSeriesExceptionsInsert,
  toCalendarEventSeriesExceptionsUpdate,
}
