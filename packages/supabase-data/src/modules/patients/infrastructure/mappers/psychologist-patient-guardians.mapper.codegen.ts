// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  PsychologistPatientGuardiansDTOSchema,
  type PsychologistPatientGuardiansDTO,
} from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-guardians.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type PsychologistPatientGuardiansRow =
  Database["public"]["Tables"]["psychologist_patient_guardians"]["Row"]
type PsychologistPatientGuardiansInsert =
  Database["public"]["Tables"]["psychologist_patient_guardians"]["Insert"]
type PsychologistPatientGuardiansUpdate =
  Database["public"]["Tables"]["psychologist_patient_guardians"]["Update"]

const PsychologistPatientGuardiansFieldMappings = {
  city: "city",
  complement: "complement",
  country: "country",
  cpf: "cpf",
  createdAt: "created_at",
  dateOfBirth: "date_of_birth",
  email: "email",
  fullName: "full_name",
  guardianType: "guardian_type",
  id: "id",
  name: "name",
  neighborhood: "neighborhood",
  number: "number",
  patientId: "patient_id",
  phone: "phone",
  postalCode: "postal_code",
  psychologistId: "psychologist_id",
  relationship: "relationship",
  rg: "rg",
  state: "state",
  status: "status",
  street: "street",
  updatedAt: "updated_at",
} as const

type PsychologistPatientGuardiansField = keyof typeof PsychologistPatientGuardiansFieldMappings

function fromPsychologistPatientGuardiansRow(
  row: PsychologistPatientGuardiansRow
): PsychologistPatientGuardiansDTO {
  const mapped = {
    city: row.city,
    complement: row.complement,
    country: row.country,
    cpf: row.cpf,
    createdAt: row.created_at,
    dateOfBirth: row.date_of_birth,
    email: row.email,
    fullName: row.full_name,
    guardianType: row.guardian_type,
    id: row.id,
    name: row.name,
    neighborhood: row.neighborhood,
    number: row.number,
    patientId: row.patient_id,
    phone: row.phone,
    postalCode: row.postal_code,
    psychologistId: row.psychologist_id,
    relationship: row.relationship,
    rg: row.rg,
    state: row.state,
    status: row.status,
    street: row.street,
    updatedAt: row.updated_at,
  }
  return PsychologistPatientGuardiansDTOSchema.parse(mapped)
}

function toPsychologistPatientGuardiansInsert(
  dto: Partial<PsychologistPatientGuardiansDTO>
): PsychologistPatientGuardiansInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(
    PsychologistPatientGuardiansFieldMappings
  ) as Array<
    [
      PsychologistPatientGuardiansField,
      (typeof PsychologistPatientGuardiansFieldMappings)[PsychologistPatientGuardiansField],
    ]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as PsychologistPatientGuardiansInsert
}

function toPsychologistPatientGuardiansUpdate(
  dto: Partial<PsychologistPatientGuardiansDTO>
): PsychologistPatientGuardiansUpdate {
  return toPsychologistPatientGuardiansInsert(dto) as PsychologistPatientGuardiansUpdate
}

export {
  fromPsychologistPatientGuardiansRow,
  toPsychologistPatientGuardiansInsert,
  toPsychologistPatientGuardiansUpdate,
}
