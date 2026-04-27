// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SessionTypesDTO } from "@workspace/supabase-data/modules/catalog/domain/dto/session-types.dto.codegen"

export interface SessionTypesListParams {
  limit?: number
  offset?: number
}

export interface SessionTypesListResult {
  rows: SessionTypesDTO[]
}

interface SessionTypesRepository {
  findById(id: string): Promise<SessionTypesDTO | null>
  list(params: SessionTypesListParams): Promise<SessionTypesListResult>
}

export { type SessionTypesRepository }
