// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { CatalogDocumentTemplatesDTO } from "@workspace/supabase-data/modules/catalog/domain/dto/catalog-document-templates.dto.codegen"
import type {
  CatalogDocumentTemplatesRepository,
  CatalogDocumentTemplatesListParams,
  CatalogDocumentTemplatesListResult,
} from "@workspace/supabase-data/modules/catalog/domain/ports/catalog-document-templates-repository.port.codegen"
import { fromCatalogDocumentTemplatesRow } from "@workspace/supabase-data/modules/catalog/infrastructure/mappers/catalog-document-templates.mapper.codegen"

class CatalogDocumentTemplatesSupabaseRepository implements CatalogDocumentTemplatesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<CatalogDocumentTemplatesDTO | null> {
    const { data, error } = await this.supabase
      .from("catalog_document_templates")
      .select(
        "created_at, created_by, description, id, template_category, template_data, title, updated_at, updated_by, usage_count"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load catalog_document_templates.", {
        cause: error,
      })
    }
    if (!data) return null
    return fromCatalogDocumentTemplatesRow(data)
  }

  async list(
    params: CatalogDocumentTemplatesListParams
  ): Promise<CatalogDocumentTemplatesListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("catalog_document_templates")
      .select(
        "created_at, created_by, description, id, template_category, template_data, title, updated_at, updated_by, usage_count"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list catalog_document_templates.", {
        cause: error,
      })
    }
    const rows = (data ?? []).map((row) => fromCatalogDocumentTemplatesRow(row))
    return { rows }
  }
}

export { CatalogDocumentTemplatesSupabaseRepository }
