// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  PsychologistServicesDTOSchema,
  type PsychologistServicesDTO,
} from "@workspace/supabase-data/modules/preferences/domain/dto/psychologist-services.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type PsychologistServicesRow = Database["public"]["Tables"]["psychologist_services"]["Row"]
type PsychologistServicesInsert = Database["public"]["Tables"]["psychologist_services"]["Insert"]
type PsychologistServicesUpdate = Database["public"]["Tables"]["psychologist_services"]["Update"]

const PsychologistServicesFieldMappings = {
  catalogId: "catalog_id",
  createdAt: "created_at",
  description: "description",
  durationMinutes: "duration_minutes",
  id: "id",
  isActive: "is_active",
  isPublic: "is_public",
  name: "name",
  price: "price",
  psychologistId: "psychologist_id",
  serviceId: "service_id",
  sortOrder: "sort_order",
  updatedAt: "updated_at",
} as const

type PsychologistServicesField = keyof typeof PsychologistServicesFieldMappings

function fromPsychologistServicesRow(row: PsychologistServicesRow): PsychologistServicesDTO {
  const mapped = {
    catalogId: row.catalog_id,
    createdAt: row.created_at,
    description: row.description,
    durationMinutes: row.duration_minutes,
    id: row.id,
    isActive: row.is_active,
    isPublic: row.is_public,
    name: row.name,
    price: row.price,
    psychologistId: row.psychologist_id,
    serviceId: row.service_id,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at,
  }
  return PsychologistServicesDTOSchema.parse(mapped)
}

function toPsychologistServicesInsert(
  dto: Partial<PsychologistServicesDTO>
): PsychologistServicesInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(PsychologistServicesFieldMappings) as Array<
    [
      PsychologistServicesField,
      (typeof PsychologistServicesFieldMappings)[PsychologistServicesField],
    ]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as PsychologistServicesInsert
}

function toPsychologistServicesUpdate(
  dto: Partial<PsychologistServicesDTO>
): PsychologistServicesUpdate {
  return toPsychologistServicesInsert(dto) as PsychologistServicesUpdate
}

export { fromPsychologistServicesRow, toPsychologistServicesInsert, toPsychologistServicesUpdate }
