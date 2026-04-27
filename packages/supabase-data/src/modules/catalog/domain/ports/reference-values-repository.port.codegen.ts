// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { ReferenceValuesDTO } from "@workspace/supabase-data/modules/catalog/domain/dto/reference-values.dto.codegen"

export interface ReferenceValuesListParams {
  limit?: number
  offset?: number
}

export interface ReferenceValuesListResult {
  rows: ReferenceValuesDTO[]
}

interface ReferenceValuesRepository {
  findById(id: string): Promise<ReferenceValuesDTO | null>
  list(params: ReferenceValuesListParams): Promise<ReferenceValuesListResult>
}

export { type ReferenceValuesRepository }
