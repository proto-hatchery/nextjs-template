// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  PsychologistPatientEmergencyContactsDTOSchema,
  type PsychologistPatientEmergencyContactsDTO,
} from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-emergency-contacts.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type PsychologistPatientEmergencyContactsRow =
  Database["public"]["Tables"]["psychologist_patient_emergency_contacts"]["Row"]
type PsychologistPatientEmergencyContactsInsert =
  Database["public"]["Tables"]["psychologist_patient_emergency_contacts"]["Insert"]
type PsychologistPatientEmergencyContactsUpdate =
  Database["public"]["Tables"]["psychologist_patient_emergency_contacts"]["Update"]

const PsychologistPatientEmergencyContactsFieldMappings = {
  contactName: "contact_name",
  createdAt: "created_at",
  createdBy: "created_by",
  email: "email",
  id: "id",
  isPrimary: "is_primary",
  notes: "notes",
  phone: "phone",
  psychologistPatientId: "psychologist_patient_id",
  relationship: "relationship",
  updatedAt: "updated_at",
  updatedBy: "updated_by",
} as const

type PsychologistPatientEmergencyContactsField =
  keyof typeof PsychologistPatientEmergencyContactsFieldMappings

function fromPsychologistPatientEmergencyContactsRow(
  row: PsychologistPatientEmergencyContactsRow
): PsychologistPatientEmergencyContactsDTO {
  const mapped = {
    contactName: row.contact_name,
    createdAt: row.created_at,
    createdBy: row.created_by,
    email: row.email,
    id: row.id,
    isPrimary: row.is_primary,
    notes: row.notes,
    phone: row.phone,
    psychologistPatientId: row.psychologist_patient_id,
    relationship: row.relationship,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  }
  return PsychologistPatientEmergencyContactsDTOSchema.parse(mapped)
}

function toPsychologistPatientEmergencyContactsInsert(
  dto: Partial<PsychologistPatientEmergencyContactsDTO>
): PsychologistPatientEmergencyContactsInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(
    PsychologistPatientEmergencyContactsFieldMappings
  ) as Array<
    [
      PsychologistPatientEmergencyContactsField,
      (typeof PsychologistPatientEmergencyContactsFieldMappings)[PsychologistPatientEmergencyContactsField],
    ]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as PsychologistPatientEmergencyContactsInsert
}

function toPsychologistPatientEmergencyContactsUpdate(
  dto: Partial<PsychologistPatientEmergencyContactsDTO>
): PsychologistPatientEmergencyContactsUpdate {
  return toPsychologistPatientEmergencyContactsInsert(
    dto
  ) as PsychologistPatientEmergencyContactsUpdate
}

export {
  fromPsychologistPatientEmergencyContactsRow,
  toPsychologistPatientEmergencyContactsInsert,
  toPsychologistPatientEmergencyContactsUpdate,
}
