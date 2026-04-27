// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { SessionTypesDTO } from "@workspace/supabase-data/modules/catalog/domain/dto/session-types.dto.codegen"
import type {
  SessionTypesRepository,
  SessionTypesListParams,
  SessionTypesListResult,
} from "@workspace/supabase-data/modules/catalog/domain/ports/session-types-repository.port.codegen"
import { fromSessionTypesRow } from "@workspace/supabase-data/modules/catalog/infrastructure/mappers/session-types.mapper.codegen"

class SessionTypesSupabaseRepository implements SessionTypesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<SessionTypesDTO | null> {
    const { data, error } = await this.supabase
      .from("session_types")
      .select("code, created_at, default_duration_minutes, id, name, updated_at")
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load session_types.", { cause: error })
    }
    if (!data) return null
    return fromSessionTypesRow(data)
  }

  async list(params: SessionTypesListParams): Promise<SessionTypesListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("session_types")
      .select("code, created_at, default_duration_minutes, id, name, updated_at")
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list session_types.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromSessionTypesRow(row))
    return { rows }
  }
}

export { SessionTypesSupabaseRepository }
