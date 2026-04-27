// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  CalendarEventsDTOSchema,
  type CalendarEventsDTO,
} from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-events.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type CalendarEventsRow = Database["public"]["Views"]["calendar_events_full"]["Row"]
type CalendarEventsInsert = Database["public"]["Tables"]["calendar_events"]["Insert"]
type CalendarEventsUpdate = Database["public"]["Tables"]["calendar_events"]["Update"]

const CalendarEventsFieldMappings = {
  allDay: "all_day",
  attendanceConfirmed: "attendance_confirmed",
  billingStatus: "billing_status",
  clinicalSessionId: "clinical_session_id",
  color: "color",
  createdAt: "created_at",
  description: "description",
  durationMinutes: "duration_minutes",
  endDatetime: "end_datetime",
  eventType: "event_type",
  googleEventId: "google_event_id",
  googleSyncError: "google_sync_error",
  googleSyncStatus: "google_sync_status",
  id: "id",
  lastSyncedAt: "last_synced_at",
  location: "location",
  metadata: "metadata",
  originalEndDatetime: "original_end_datetime",
  originalStartDatetime: "original_start_datetime",
  patientDisplayName: "patient_display_name",
  patientName: "patient_name",
  privateNotes: "private_notes",
  psychologistId: "psychologist_id",
  psychologistPatientId: "psychologist_patient_id",
  psychologistServiceId: "psychologist_service_id",
  seriesId: "series_id",
  serviceDuration: "service_duration",
  serviceName: "service_name",
  servicePrice: "service_price",
  sessionNumber: "session_number",
  source: "source",
  startDatetime: "start_datetime",
  status: "status",
  timezone: "timezone",
  title: "title",
  updatedAt: "updated_at",
} as const

type CalendarEventsField = keyof typeof CalendarEventsFieldMappings

function fromCalendarEventsRow(row: CalendarEventsRow): CalendarEventsDTO {
  const mapped = {
    allDay: row.all_day,
    attendanceConfirmed: row.attendance_confirmed,
    billingStatus: row.billing_status,
    clinicalSessionId: row.clinical_session_id,
    color: row.color,
    createdAt: row.created_at,
    description: row.description,
    durationMinutes: row.duration_minutes,
    endDatetime: row.end_datetime,
    eventType: row.event_type,
    googleEventId: row.google_event_id,
    googleSyncError: row.google_sync_error,
    googleSyncStatus: row.google_sync_status,
    id: row.id,
    lastSyncedAt: row.last_synced_at,
    location: row.location,
    metadata: row.metadata,
    originalEndDatetime: row.original_end_datetime,
    originalStartDatetime: row.original_start_datetime,
    patientDisplayName: row.patient_display_name,
    patientName: row.patient_name,
    privateNotes: row.private_notes,
    psychologistId: row.psychologist_id,
    psychologistPatientId: row.psychologist_patient_id,
    psychologistServiceId: row.psychologist_service_id,
    seriesId: row.series_id,
    serviceDuration: row.service_duration,
    serviceName: row.service_name,
    servicePrice: row.service_price,
    sessionNumber: row.session_number,
    source: row.source,
    startDatetime: row.start_datetime,
    status: row.status,
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
