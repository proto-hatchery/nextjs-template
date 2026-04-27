// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  PsychologistPatientAssessmentsDTOSchema,
  type PsychologistPatientAssessmentsDTO,
} from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-assessments.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type PsychologistPatientAssessmentsRow =
  Database["public"]["Tables"]["psychologist_patient_assessments"]["Row"]
type PsychologistPatientAssessmentsInsert =
  Database["public"]["Tables"]["psychologist_patient_assessments"]["Insert"]
type PsychologistPatientAssessmentsUpdate =
  Database["public"]["Tables"]["psychologist_patient_assessments"]["Update"]

const PsychologistPatientAssessmentsFieldMappings = {
  appliedAt: "applied_at",
  clinicalNoteId: "clinical_note_id",
  createdAt: "created_at",
  createdBy: "created_by",
  fileUrl: "file_url",
  id: "id",
  interpretation: "interpretation",
  isArchived: "is_archived",
  name: "name",
  notes: "notes",
  patientId: "patient_id",
  psychologistClientId: "psychologist_client_id",
  psychologistId: "psychologist_id",
  psychologistNotes: "psychologist_notes",
  results: "results",
  status: "status",
  tags: "tags",
  testDate: "test_date",
  testId: "test_id",
  testName: "test_name",
  testType: "test_type",
  updatedAt: "updated_at",
  updatedBy: "updated_by",
} as const

type PsychologistPatientAssessmentsField = keyof typeof PsychologistPatientAssessmentsFieldMappings

function fromPsychologistPatientAssessmentsRow(
  row: PsychologistPatientAssessmentsRow
): PsychologistPatientAssessmentsDTO {
  const mapped = {
    appliedAt: row.applied_at,
    clinicalNoteId: row.clinical_note_id,
    createdAt: row.created_at,
    createdBy: row.created_by,
    fileUrl: row.file_url,
    id: row.id,
    interpretation: row.interpretation,
    isArchived: row.is_archived,
    name: row.name,
    notes: row.notes,
    patientId: row.patient_id,
    psychologistClientId: row.psychologist_client_id,
    psychologistId: row.psychologist_id,
    psychologistNotes: row.psychologist_notes,
    results: row.results,
    status: row.status,
    tags: row.tags,
    testDate: row.test_date,
    testId: row.test_id,
    testName: row.test_name,
    testType: row.test_type,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  }
  return PsychologistPatientAssessmentsDTOSchema.parse(mapped)
}

function toPsychologistPatientAssessmentsInsert(
  dto: Partial<PsychologistPatientAssessmentsDTO>
): PsychologistPatientAssessmentsInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(
    PsychologistPatientAssessmentsFieldMappings
  ) as Array<
    [
      PsychologistPatientAssessmentsField,
      (typeof PsychologistPatientAssessmentsFieldMappings)[PsychologistPatientAssessmentsField],
    ]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as PsychologistPatientAssessmentsInsert
}

function toPsychologistPatientAssessmentsUpdate(
  dto: Partial<PsychologistPatientAssessmentsDTO>
): PsychologistPatientAssessmentsUpdate {
  return toPsychologistPatientAssessmentsInsert(dto) as PsychologistPatientAssessmentsUpdate
}

export {
  fromPsychologistPatientAssessmentsRow,
  toPsychologistPatientAssessmentsInsert,
  toPsychologistPatientAssessmentsUpdate,
}
