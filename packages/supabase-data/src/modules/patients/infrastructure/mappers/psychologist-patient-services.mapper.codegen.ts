// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  PsychologistPatientServicesDTOSchema,
  type PsychologistPatientServicesDTO,
} from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-services.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type PsychologistPatientServicesRow =
  Database["public"]["Tables"]["psychologist_patient_services"]["Row"]
type PsychologistPatientServicesInsert =
  Database["public"]["Tables"]["psychologist_patient_services"]["Insert"]
type PsychologistPatientServicesUpdate =
  Database["public"]["Tables"]["psychologist_patient_services"]["Update"]

const PsychologistPatientServicesFieldMappings = {
  createdAt: "created_at",
  id: "id",
  priceCents: "price_cents",
  psychologistId: "psychologist_id",
  psychologistPatientId: "psychologist_patient_id",
  serviceId: "service_id",
  updatedAt: "updated_at",
} as const

type PsychologistPatientServicesField = keyof typeof PsychologistPatientServicesFieldMappings

function fromPsychologistPatientServicesRow(
  row: PsychologistPatientServicesRow
): PsychologistPatientServicesDTO {
  const mapped = {
    createdAt: row.created_at,
    id: row.id,
    priceCents: row.price_cents,
    psychologistId: row.psychologist_id,
    psychologistPatientId: row.psychologist_patient_id,
    serviceId: row.service_id,
    updatedAt: row.updated_at,
  }
  return PsychologistPatientServicesDTOSchema.parse(mapped)
}

function toPsychologistPatientServicesInsert(
  dto: Partial<PsychologistPatientServicesDTO>
): PsychologistPatientServicesInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(
    PsychologistPatientServicesFieldMappings
  ) as Array<
    [
      PsychologistPatientServicesField,
      (typeof PsychologistPatientServicesFieldMappings)[PsychologistPatientServicesField],
    ]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as PsychologistPatientServicesInsert
}

function toPsychologistPatientServicesUpdate(
  dto: Partial<PsychologistPatientServicesDTO>
): PsychologistPatientServicesUpdate {
  return toPsychologistPatientServicesInsert(dto) as PsychologistPatientServicesUpdate
}

export {
  fromPsychologistPatientServicesRow,
  toPsychologistPatientServicesInsert,
  toPsychologistPatientServicesUpdate,
}
