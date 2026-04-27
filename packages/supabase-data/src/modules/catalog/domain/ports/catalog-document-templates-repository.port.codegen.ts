// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { CatalogDocumentTemplatesDTO } from "@workspace/supabase-data/modules/catalog/domain/dto/catalog-document-templates.dto.codegen"

export interface CatalogDocumentTemplatesListParams {
  limit?: number
  offset?: number
}

export interface CatalogDocumentTemplatesListResult {
  rows: CatalogDocumentTemplatesDTO[]
}

interface CatalogDocumentTemplatesRepository {
  findById(id: string): Promise<CatalogDocumentTemplatesDTO | null>
  list(params: CatalogDocumentTemplatesListParams): Promise<CatalogDocumentTemplatesListResult>
}

export { type CatalogDocumentTemplatesRepository }
