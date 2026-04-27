// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  CalendarEventSeriesDTOSchema,
  type CalendarEventSeriesDTO,
} from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-event-series.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type CalendarEventSeriesRow = Database["public"]["Tables"]["calendar_event_series"]["Row"]
type CalendarEventSeriesInsert = Database["public"]["Tables"]["calendar_event_series"]["Insert"]
type CalendarEventSeriesUpdate = Database["public"]["Tables"]["calendar_event_series"]["Update"]

const CalendarEventSeriesFieldMappings = {
  allDay: "all_day",
  color: "color",
  createdAt: "created_at",
  description: "description",
  durationMinutes: "duration_minutes",
  effectiveEnd: "effective_end",
  effectiveStart: "effective_start",
  endTime: "end_time",
  eventType: "event_type",
  googleEventId: "google_event_id",
  googleSyncStatus: "google_sync_status",
  id: "id",
  location: "location",
  metadata: "metadata",
  psychologistId: "psychologist_id",
  rrule: "rrule",
  startTime: "start_time",
  timezone: "timezone",
  title: "title",
  updatedAt: "updated_at",
} as const

type CalendarEventSeriesField = keyof typeof CalendarEventSeriesFieldMappings

function fromCalendarEventSeriesRow(row: CalendarEventSeriesRow): CalendarEventSeriesDTO {
  const mapped = {
    allDay: row.all_day,
    color: row.color,
    createdAt: row.created_at,
    description: row.description,
    durationMinutes: row.duration_minutes,
    effectiveEnd: row.effective_end,
    effectiveStart: row.effective_start,
    endTime: row.end_time,
    eventType: row.event_type,
    googleEventId: row.google_event_id,
    googleSyncStatus: row.google_sync_status,
    id: row.id,
    location: row.location,
    metadata: row.metadata,
    psychologistId: row.psychologist_id,
    rrule: row.rrule,
    startTime: row.start_time,
    timezone: row.timezone,
    title: row.title,
    updatedAt: row.updated_at,
  }
  return CalendarEventSeriesDTOSchema.parse(mapped)
}

function toCalendarEventSeriesInsert(
  dto: Partial<CalendarEventSeriesDTO>
): CalendarEventSeriesInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(CalendarEventSeriesFieldMappings) as Array<
    [CalendarEventSeriesField, (typeof CalendarEventSeriesFieldMappings)[CalendarEventSeriesField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as CalendarEventSeriesInsert
}

function toCalendarEventSeriesUpdate(
  dto: Partial<CalendarEventSeriesDTO>
): CalendarEventSeriesUpdate {
  return toCalendarEventSeriesInsert(dto) as CalendarEventSeriesUpdate
}

export { fromCalendarEventSeriesRow, toCalendarEventSeriesInsert, toCalendarEventSeriesUpdate }
