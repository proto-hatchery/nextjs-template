// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { Database } from "@workspace/supabase-infra/types/database"

import { ReferenceValuesDTOSchema, type ReferenceValuesDTO } from "@workspace/supabase-data/modules/catalog/domain/dto/reference-values.dto.codegen"

type ReferenceValuesRow = Database["public"]["Tables"]["reference_values"]["Row"]
type ReferenceValuesInsert = Database["public"]["Tables"]["reference_values"]["Insert"]
type ReferenceValuesUpdate = Database["public"]["Tables"]["reference_values"]["Update"]

const ReferenceValuesFieldMappings = {
  category: "category",
  createdAt: "created_at",
  id: "id",
  isActive: "is_active",
  labelPt: "label_pt",
  metadata: "metadata",
  updatedAt: "updated_at",
  value: "value",
} as const

type ReferenceValuesField = keyof typeof ReferenceValuesFieldMappings

function fromReferenceValuesRow(row: ReferenceValuesRow): ReferenceValuesDTO {
  const mapped = {
    category: row.category,
    createdAt: row.created_at,
    id: row.id,
    isActive: row.is_active,
    labelPt: row.label_pt,
    metadata: row.metadata,
    updatedAt: row.updated_at,
    value: row.value,
  }
  return ReferenceValuesDTOSchema.parse(mapped)
}

function toReferenceValuesInsert(dto: Partial<ReferenceValuesDTO>): ReferenceValuesInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(ReferenceValuesFieldMappings) as Array<
    [ReferenceValuesField, (typeof ReferenceValuesFieldMappings)[ReferenceValuesField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as ReferenceValuesInsert
}

function toReferenceValuesUpdate(dto: Partial<ReferenceValuesDTO>): ReferenceValuesUpdate {
  return toReferenceValuesInsert(dto) as ReferenceValuesUpdate
}

export { fromReferenceValuesRow, toReferenceValuesInsert, toReferenceValuesUpdate }
