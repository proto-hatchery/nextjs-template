// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { ReferenceValuesDTO } from "@workspace/supabase-data/modules/catalog/domain/dto/reference-values.dto.codegen"
import type {
  ReferenceValuesRepository,
  ReferenceValuesListParams,
  ReferenceValuesListResult,
} from "@workspace/supabase-data/modules/catalog/domain/ports/reference-values-repository.port.codegen"
import { fromReferenceValuesRow } from "@workspace/supabase-data/modules/catalog/infrastructure/mappers/reference-values.mapper.codegen"

class ReferenceValuesSupabaseRepository implements ReferenceValuesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<ReferenceValuesDTO | null> {
    const { data, error } = await this.supabase
      .from("reference_values")
      .select("category, created_at, id, is_active, label_pt, metadata, updated_at, value")
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load reference_values.", { cause: error })
    }
    if (!data) return null
    return fromReferenceValuesRow(data)
  }

  async list(params: ReferenceValuesListParams): Promise<ReferenceValuesListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("reference_values")
      .select("category, created_at, id, is_active, label_pt, metadata, updated_at, value")
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list reference_values.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromReferenceValuesRow(row))
    return { rows }
  }
}

export { ReferenceValuesSupabaseRepository }
