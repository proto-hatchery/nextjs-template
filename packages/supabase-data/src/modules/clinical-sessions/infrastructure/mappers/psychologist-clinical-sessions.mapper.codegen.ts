// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  PsychologistClinicalSessionsDTOSchema,
  type PsychologistClinicalSessionsDTO,
} from "@workspace/supabase-data/modules/clinical-sessions/domain/dto/psychologist-clinical-sessions.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type PsychologistClinicalSessionsRow =
  Database["public"]["Tables"]["psychologist_clinical_sessions"]["Row"]
type PsychologistClinicalSessionsInsert =
  Database["public"]["Tables"]["psychologist_clinical_sessions"]["Insert"]
type PsychologistClinicalSessionsUpdate =
  Database["public"]["Tables"]["psychologist_clinical_sessions"]["Update"]

const PsychologistClinicalSessionsFieldMappings = {
  attendanceConfirmed: "attendance_confirmed",
  automationMetadata: "automation_metadata",
  billingAttemptCount: "billing_attempt_count",
  billingLastError: "billing_last_error",
  billingNextAttemptAt: "billing_next_attempt_at",
  billingStatus: "billing_status",
  calendarEventId: "calendar_event_id",
  confirmationSentAt: "confirmation_sent_at",
  createdAt: "created_at",
  createdBy: "created_by",
  customPriceCents: "custom_price_cents",
  defaultChargeId: "default_charge_id",
  durationMinutes: "duration_minutes",
  id: "id",
  locationId: "location_id",
  noteId: "note_id",
  notes: "notes",
  psychologistId: "psychologist_id",
  psychologistPatientId: "psychologist_patient_id",
  psychologistServiceId: "psychologist_service_id",
  reminderSentAt: "reminder_sent_at",
  sessionNumber: "session_number",
  snapshotPrice: "snapshot_price",
  snapshotPriceCents: "snapshot_price_cents",
  snapshotServiceName: "snapshot_service_name",
  startTime: "start_time",
  status: "status",
  statusReason: "status_reason",
  updatedAt: "updated_at",
  updatedBy: "updated_by",
} as const

type PsychologistClinicalSessionsField = keyof typeof PsychologistClinicalSessionsFieldMappings

function fromPsychologistClinicalSessionsRow(
  row: PsychologistClinicalSessionsRow
): PsychologistClinicalSessionsDTO {
  const mapped = {
    attendanceConfirmed: row.attendance_confirmed,
    automationMetadata: row.automation_metadata,
    billingAttemptCount: row.billing_attempt_count,
    billingLastError: row.billing_last_error,
    billingNextAttemptAt: row.billing_next_attempt_at,
    billingStatus: row.billing_status,
    calendarEventId: row.calendar_event_id,
    confirmationSentAt: row.confirmation_sent_at,
    createdAt: row.created_at,
    createdBy: row.created_by,
    customPriceCents: row.custom_price_cents,
    defaultChargeId: row.default_charge_id,
    durationMinutes: row.duration_minutes,
    id: row.id,
    locationId: row.location_id,
    noteId: row.note_id,
    notes: row.notes,
    psychologistId: row.psychologist_id,
    psychologistPatientId: row.psychologist_patient_id,
    psychologistServiceId: row.psychologist_service_id,
    reminderSentAt: row.reminder_sent_at,
    sessionNumber: row.session_number,
    snapshotPrice: row.snapshot_price,
    snapshotPriceCents: row.snapshot_price_cents,
    snapshotServiceName: row.snapshot_service_name,
    startTime: row.start_time,
    status: row.status,
    statusReason: row.status_reason,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  }
  return PsychologistClinicalSessionsDTOSchema.parse(mapped)
}

function toPsychologistClinicalSessionsInsert(
  dto: Partial<PsychologistClinicalSessionsDTO>
): PsychologistClinicalSessionsInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(
    PsychologistClinicalSessionsFieldMappings
  ) as Array<
    [
      PsychologistClinicalSessionsField,
      (typeof PsychologistClinicalSessionsFieldMappings)[PsychologistClinicalSessionsField],
    ]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as PsychologistClinicalSessionsInsert
}

function toPsychologistClinicalSessionsUpdate(
  dto: Partial<PsychologistClinicalSessionsDTO>
): PsychologistClinicalSessionsUpdate {
  return toPsychologistClinicalSessionsInsert(dto) as PsychologistClinicalSessionsUpdate
}

export {
  fromPsychologistClinicalSessionsRow,
  toPsychologistClinicalSessionsInsert,
  toPsychologistClinicalSessionsUpdate,
}
