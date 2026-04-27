// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  ReferenceValuesDTOSchema,
  type ReferenceValuesDTO,
} from "@workspace/supabase-data/modules/catalog/domain/dto/reference-values.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type ReferenceValuesRow = Database["public"]["Tables"]["reference_values"]["Row"]

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

type _ReferenceValuesField = keyof typeof ReferenceValuesFieldMappings

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

export { fromReferenceValuesRow }
