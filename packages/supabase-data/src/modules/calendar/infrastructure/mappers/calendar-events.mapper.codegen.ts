// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { Database } from "@workspace/supabase-infra/types/database"

import { CalendarEventsDTOSchema, type CalendarEventsDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-events.dto.codegen"

type CalendarEventsRow = Database["public"]["Tables"]["calendar_events"]["Row"]
type CalendarEventsInsert = Database["public"]["Tables"]["calendar_events"]["Insert"]
type CalendarEventsUpdate = Database["public"]["Tables"]["calendar_events"]["Update"]

const CalendarEventsFieldMappings = {
  allDay: "all_day",
  color: "color",
  createdAt: "created_at",
  description: "description",
  durationMinutes: "duration_minutes",
  endDatetime: "end_datetime",
  eventType: "event_type",
  googleEventId: "google_event_id",
  googleOriginalStartTime: "google_original_start_time",
  googleRecurringEventId: "google_recurring_event_id",
  googleSyncError: "google_sync_error",
  googleSyncStatus: "google_sync_status",
  id: "id",
  lastSyncedAt: "last_synced_at",
  location: "location",
  metadata: "metadata",
  originalEndDatetime: "original_end_datetime",
  originalStartDatetime: "original_start_datetime",
  privateNotes: "private_notes",
  psychologistId: "psychologist_id",
  remoteEtag: "remote_etag",
  remoteUpdatedAt: "remote_updated_at",
  seriesId: "series_id",
  source: "source",
  startDatetime: "start_datetime",
  status: "status",
  syncOrigin: "sync_origin",
  timezone: "timezone",
  title: "title",
  updatedAt: "updated_at",
} as const

type CalendarEventsField = keyof typeof CalendarEventsFieldMappings

function fromCalendarEventsRow(row: CalendarEventsRow): CalendarEventsDTO {
  const mapped = {
    allDay: row.all_day,
    color: row.color,
    createdAt: row.created_at,
    description: row.description,
    durationMinutes: row.duration_minutes,
    endDatetime: row.end_datetime,
    eventType: row.event_type,
    googleEventId: row.google_event_id,
    googleOriginalStartTime: row.google_original_start_time,
    googleRecurringEventId: row.google_recurring_event_id,
    googleSyncError: row.google_sync_error,
    googleSyncStatus: row.google_sync_status,
    id: row.id,
    lastSyncedAt: row.last_synced_at,
    location: row.location,
    metadata: row.metadata,
    originalEndDatetime: row.original_end_datetime,
    originalStartDatetime: row.original_start_datetime,
    privateNotes: row.private_notes,
    psychologistId: row.psychologist_id,
    remoteEtag: row.remote_etag,
    remoteUpdatedAt: row.remote_updated_at,
    seriesId: row.series_id,
    source: row.source,
    startDatetime: row.start_datetime,
    status: row.status,
    syncOrigin: row.sync_origin,
    timezone: row.timezone,
    title: row.title,
    updatedAt: row.updated_at,
  }
  return CalendarEventsDTOSchema.parse(mapped)
}

function toCalendarEventsInsert(dto: Partial<CalendarEventsDTO>): CalendarEventsInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(CalendarEventsFieldMappings) as Array<
    [CalendarEventsField, (typeof CalendarEventsFieldMappings)[CalendarEventsField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as CalendarEventsInsert
}

function toCalendarEventsUpdate(dto: Partial<CalendarEventsDTO>): CalendarEventsUpdate {
  return toCalendarEventsInsert(dto) as CalendarEventsUpdate
}

export { fromCalendarEventsRow, toCalendarEventsInsert, toCalendarEventsUpdate }
