// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  TherapeuticSessionEventsDTOSchema,
  type TherapeuticSessionEventsDTO,
} from "@workspace/supabase-data/modules/clinical-sessions/domain/dto/therapeutic-session-events.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type TherapeuticSessionEventsRow = Database["public"]["Views"]["therapeutic_session_events"]["Row"]

const TherapeuticSessionEventsFieldMappings = {
  allDay: "all_day",
  attendanceConfirmed: "attendance_confirmed",
  billingAttemptCount: "billing_attempt_count",
  billingLastAttemptAt: "billing_last_attempt_at",
  billingLastError: "billing_last_error",
  billingNextAttemptAt: "billing_next_attempt_at",
  billingStatus: "billing_status",
  calendarEventId: "calendar_event_id",
  clinicalSessionId: "clinical_session_id",
  color: "color",
  confirmationSentAt: "confirmation_sent_at",
  createdAt: "created_at",
  description: "description",
  durationMinutes: "duration_minutes",
  endDatetime: "end_datetime",
  googleEventId: "google_event_id",
  googleSyncError: "google_sync_error",
  googleSyncStatus: "google_sync_status",
  lastSyncedAt: "last_synced_at",
  legacySessionId: "legacy_session_id",
  location: "location",
  metadata: "metadata",
  patientDisplayName: "patient_display_name",
  patientName: "patient_name",
  privateNotes: "private_notes",
  psychologistId: "psychologist_id",
  psychologistPatientId: "psychologist_patient_id",
  psychologistServiceId: "psychologist_service_id",
  reminderSentAt: "reminder_sent_at",
  schedulingStatus: "scheduling_status",
  seriesId: "series_id",
  serviceDuration: "service_duration",
  serviceName: "service_name",
  servicePrice: "service_price",
  sessionDetailId: "session_detail_id",
  sessionNumber: "session_number",
  sessionTypeId: "session_type_id",
  source: "source",
  startDatetime: "start_datetime",
  timezone: "timezone",
  title: "title",
  updatedAt: "updated_at",
} as const

type _TherapeuticSessionEventsField = keyof typeof TherapeuticSessionEventsFieldMappings

function fromTherapeuticSessionEventsRow(
  row: TherapeuticSessionEventsRow
): TherapeuticSessionEventsDTO {
  const mapped = {
    allDay: row.all_day,
    attendanceConfirmed: row.attendance_confirmed,
    billingAttemptCount: row.billing_attempt_count,
    billingLastAttemptAt: row.billing_last_attempt_at,
    billingLastError: row.billing_last_error,
    billingNextAttemptAt: row.billing_next_attempt_at,
    billingStatus: row.billing_status,
    calendarEventId: row.calendar_event_id,
    clinicalSessionId: row.clinical_session_id,
    color: row.color,
    confirmationSentAt: row.confirmation_sent_at,
    createdAt: row.created_at,
    description: row.description,
    durationMinutes: row.duration_minutes,
    endDatetime: row.end_datetime,
    googleEventId: row.google_event_id,
    googleSyncError: row.google_sync_error,
    googleSyncStatus: row.google_sync_status,
    lastSyncedAt: row.last_synced_at,
    legacySessionId: row.legacy_session_id,
    location: row.location,
    metadata: row.metadata,
    patientDisplayName: row.patient_display_name,
    patientName: row.patient_name,
    privateNotes: row.private_notes,
    psychologistId: row.psychologist_id,
    psychologistPatientId: row.psychologist_patient_id,
    psychologistServiceId: row.psychologist_service_id,
    reminderSentAt: row.reminder_sent_at,
    schedulingStatus: row.scheduling_status,
    seriesId: row.series_id,
    serviceDuration: row.service_duration,
    serviceName: row.service_name,
    servicePrice: row.service_price,
    sessionDetailId: row.session_detail_id,
    sessionNumber: row.session_number,
    sessionTypeId: row.session_type_id,
    source: row.source,
    startDatetime: row.start_datetime,
    timezone: row.timezone,
    title: row.title,
    updatedAt: row.updated_at,
  }
  return TherapeuticSessionEventsDTOSchema.parse(mapped)
}

export { fromTherapeuticSessionEventsRow }
