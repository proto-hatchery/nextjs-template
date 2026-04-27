// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  ClinicalSessionDetailsDTOSchema,
  type ClinicalSessionDetailsDTO,
} from "@workspace/supabase-data/modules/clinical-sessions/domain/dto/clinical-session-details.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type ClinicalSessionDetailsRow = Database["public"]["Tables"]["clinical_session_details"]["Row"]
type ClinicalSessionDetailsInsert =
  Database["public"]["Tables"]["clinical_session_details"]["Insert"]
type ClinicalSessionDetailsUpdate =
  Database["public"]["Tables"]["clinical_session_details"]["Update"]

const ClinicalSessionDetailsFieldMappings = {
  attendanceConfirmed: "attendance_confirmed",
  billingAttemptCount: "billing_attempt_count",
  billingLastAttemptAt: "billing_last_attempt_at",
  billingLastError: "billing_last_error",
  billingNextAttemptAt: "billing_next_attempt_at",
  billingStatus: "billing_status",
  calendarEventId: "calendar_event_id",
  clinicalSessionId: "clinical_session_id",
  confirmationSentAt: "confirmation_sent_at",
  createdAt: "created_at",
  id: "id",
  patientId: "patient_id",
  psychologistClientId: "psychologist_client_id",
  psychologistServiceId: "psychologist_service_id",
  reminderSentAt: "reminder_sent_at",
  sessionNumber: "session_number",
  sessionTypeId: "session_type_id",
  updatedAt: "updated_at",
} as const

type ClinicalSessionDetailsField = keyof typeof ClinicalSessionDetailsFieldMappings

function fromClinicalSessionDetailsRow(row: ClinicalSessionDetailsRow): ClinicalSessionDetailsDTO {
  const mapped = {
    attendanceConfirmed: row.attendance_confirmed,
    billingAttemptCount: row.billing_attempt_count,
    billingLastAttemptAt: row.billing_last_attempt_at,
    billingLastError: row.billing_last_error,
    billingNextAttemptAt: row.billing_next_attempt_at,
    billingStatus: row.billing_status,
    calendarEventId: row.calendar_event_id,
    clinicalSessionId: row.clinical_session_id,
    confirmationSentAt: row.confirmation_sent_at,
    createdAt: row.created_at,
    id: row.id,
    patientId: row.patient_id,
    psychologistClientId: row.psychologist_client_id,
    psychologistServiceId: row.psychologist_service_id,
    reminderSentAt: row.reminder_sent_at,
    sessionNumber: row.session_number,
    sessionTypeId: row.session_type_id,
    updatedAt: row.updated_at,
  }
  return ClinicalSessionDetailsDTOSchema.parse(mapped)
}

function toClinicalSessionDetailsInsert(
  dto: Partial<ClinicalSessionDetailsDTO>
): ClinicalSessionDetailsInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(ClinicalSessionDetailsFieldMappings) as Array<
    [
      ClinicalSessionDetailsField,
      (typeof ClinicalSessionDetailsFieldMappings)[ClinicalSessionDetailsField],
    ]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as ClinicalSessionDetailsInsert
}

function toClinicalSessionDetailsUpdate(
  dto: Partial<ClinicalSessionDetailsDTO>
): ClinicalSessionDetailsUpdate {
  return toClinicalSessionDetailsInsert(dto) as ClinicalSessionDetailsUpdate
}

export {
  fromClinicalSessionDetailsRow,
  toClinicalSessionDetailsInsert,
  toClinicalSessionDetailsUpdate,
}
