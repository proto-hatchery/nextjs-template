// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  PsychologistPatientMedicalItemsDTOSchema,
  type PsychologistPatientMedicalItemsDTO,
} from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-medical-items.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type PsychologistPatientMedicalItemsRow =
  Database["public"]["Tables"]["psychologist_patient_medical_items"]["Row"]
type PsychologistPatientMedicalItemsInsert =
  Database["public"]["Tables"]["psychologist_patient_medical_items"]["Insert"]
type PsychologistPatientMedicalItemsUpdate =
  Database["public"]["Tables"]["psychologist_patient_medical_items"]["Update"]

const PsychologistPatientMedicalItemsFieldMappings = {
  createdAt: "created_at",
  description: "description",
  diagnosedDate: "diagnosed_date",
  dosage: "dosage",
  endDate: "end_date",
  frequency: "frequency",
  icd10Code: "icd10_code",
  id: "id",
  isActive: "is_active",
  itemKind: "item_kind",
  kind: "kind",
  name: "name",
  notes: "notes",
  psychologistId: "psychologist_id",
  psychologistPatientId: "psychologist_patient_id",
  startDate: "start_date",
  updatedAt: "updated_at",
} as const

type PsychologistPatientMedicalItemsField =
  keyof typeof PsychologistPatientMedicalItemsFieldMappings

function fromPsychologistPatientMedicalItemsRow(
  row: PsychologistPatientMedicalItemsRow
): PsychologistPatientMedicalItemsDTO {
  const mapped = {
    createdAt: row.created_at,
    description: row.description,
    diagnosedDate: row.diagnosed_date,
    dosage: row.dosage,
    endDate: row.end_date,
    frequency: row.frequency,
    icd10Code: row.icd10_code,
    id: row.id,
    isActive: row.is_active,
    itemKind: row.item_kind,
    kind: row.kind,
    name: row.name,
    notes: row.notes,
    psychologistId: row.psychologist_id,
    psychologistPatientId: row.psychologist_patient_id,
    startDate: row.start_date,
    updatedAt: row.updated_at,
  }
  return PsychologistPatientMedicalItemsDTOSchema.parse(mapped)
}

function toPsychologistPatientMedicalItemsInsert(
  dto: Partial<PsychologistPatientMedicalItemsDTO>
): PsychologistPatientMedicalItemsInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(
    PsychologistPatientMedicalItemsFieldMappings
  ) as Array<
    [
      PsychologistPatientMedicalItemsField,
      (typeof PsychologistPatientMedicalItemsFieldMappings)[PsychologistPatientMedicalItemsField],
    ]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as PsychologistPatientMedicalItemsInsert
}

function toPsychologistPatientMedicalItemsUpdate(
  dto: Partial<PsychologistPatientMedicalItemsDTO>
): PsychologistPatientMedicalItemsUpdate {
  return toPsychologistPatientMedicalItemsInsert(dto) as PsychologistPatientMedicalItemsUpdate
}

export {
  fromPsychologistPatientMedicalItemsRow,
  toPsychologistPatientMedicalItemsInsert,
  toPsychologistPatientMedicalItemsUpdate,
}
