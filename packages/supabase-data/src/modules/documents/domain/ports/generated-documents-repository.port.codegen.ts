// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { GeneratedDocumentsDTO } from "@workspace/supabase-data/modules/documents/domain/dto/generated-documents.dto.codegen"

export interface GeneratedDocumentsListParams {
  limit?: number
  offset?: number
}

export interface GeneratedDocumentsListResult {
  rows: GeneratedDocumentsDTO[]
}

interface GeneratedDocumentsRepository {
  findById(id: string): Promise<GeneratedDocumentsDTO | null>
  list(params: GeneratedDocumentsListParams): Promise<GeneratedDocumentsListResult>
  insert(data: Partial<GeneratedDocumentsDTO>): Promise<GeneratedDocumentsDTO>
  update(id: string, patch: Partial<GeneratedDocumentsDTO>): Promise<GeneratedDocumentsDTO>
  delete(id: string): Promise<void>
}

export { type GeneratedDocumentsRepository }
