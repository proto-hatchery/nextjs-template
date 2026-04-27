// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  PsychologistPatientActivitiesDTOSchema,
  type PsychologistPatientActivitiesDTO,
} from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-activities.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type PsychologistPatientActivitiesRow =
  Database["public"]["Tables"]["psychologist_patient_activities"]["Row"]
type PsychologistPatientActivitiesInsert =
  Database["public"]["Tables"]["psychologist_patient_activities"]["Insert"]
type PsychologistPatientActivitiesUpdate =
  Database["public"]["Tables"]["psychologist_patient_activities"]["Update"]

const PsychologistPatientActivitiesFieldMappings = {
  activityId: "activity_id",
  assignedAt: "assigned_at",
  completedAt: "completed_at",
  createdAt: "created_at",
  createdBy: "created_by",
  dueDate: "due_date",
  id: "id",
  instructions: "instructions",
  isArchived: "is_archived",
  patientFeedback: "patient_feedback",
  patientId: "patient_id",
  psychologistClientId: "psychologist_client_id",
  psychologistId: "psychologist_id",
  responseData: "response_data",
  status: "status",
  submittedAt: "submitted_at",
  therapistComment: "therapist_comment",
  title: "title",
  updatedAt: "updated_at",
  updatedBy: "updated_by",
} as const

type PsychologistPatientActivitiesField = keyof typeof PsychologistPatientActivitiesFieldMappings

function fromPsychologistPatientActivitiesRow(
  row: PsychologistPatientActivitiesRow
): PsychologistPatientActivitiesDTO {
  const mapped = {
    activityId: row.activity_id,
    assignedAt: row.assigned_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    createdBy: row.created_by,
    dueDate: row.due_date,
    id: row.id,
    instructions: row.instructions,
    isArchived: row.is_archived,
    patientFeedback: row.patient_feedback,
    patientId: row.patient_id,
    psychologistClientId: row.psychologist_client_id,
    psychologistId: row.psychologist_id,
    responseData: row.response_data,
    status: row.status,
    submittedAt: row.submitted_at,
    therapistComment: row.therapist_comment,
    title: row.title,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  }
  return PsychologistPatientActivitiesDTOSchema.parse(mapped)
}

function toPsychologistPatientActivitiesInsert(
  dto: Partial<PsychologistPatientActivitiesDTO>
): PsychologistPatientActivitiesInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(
    PsychologistPatientActivitiesFieldMappings
  ) as Array<
    [
      PsychologistPatientActivitiesField,
      (typeof PsychologistPatientActivitiesFieldMappings)[PsychologistPatientActivitiesField],
    ]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as PsychologistPatientActivitiesInsert
}

function toPsychologistPatientActivitiesUpdate(
  dto: Partial<PsychologistPatientActivitiesDTO>
): PsychologistPatientActivitiesUpdate {
  return toPsychologistPatientActivitiesInsert(dto) as PsychologistPatientActivitiesUpdate
}

export {
  fromPsychologistPatientActivitiesRow,
  toPsychologistPatientActivitiesInsert,
  toPsychologistPatientActivitiesUpdate,
}
