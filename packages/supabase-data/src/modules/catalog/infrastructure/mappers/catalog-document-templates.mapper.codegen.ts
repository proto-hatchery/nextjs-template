// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  CatalogDocumentTemplatesDTOSchema,
  type CatalogDocumentTemplatesDTO,
} from "@workspace/supabase-data/modules/catalog/domain/dto/catalog-document-templates.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type CatalogDocumentTemplatesRow = Database["public"]["Tables"]["catalog_document_templates"]["Row"]

const CatalogDocumentTemplatesFieldMappings = {
  createdAt: "created_at",
  createdBy: "created_by",
  description: "description",
  id: "id",
  templateCategory: "template_category",
  templateData: "template_data",
  title: "title",
  updatedAt: "updated_at",
  updatedBy: "updated_by",
  usageCount: "usage_count",
} as const

type _CatalogDocumentTemplatesField = keyof typeof CatalogDocumentTemplatesFieldMappings

function fromCatalogDocumentTemplatesRow(
  row: CatalogDocumentTemplatesRow
): CatalogDocumentTemplatesDTO {
  const mapped = {
    createdAt: row.created_at,
    createdBy: row.created_by,
    description: row.description,
    id: row.id,
    templateCategory: row.template_category,
    templateData: row.template_data,
    title: row.title,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
    usageCount: row.usage_count,
  }
  return CatalogDocumentTemplatesDTOSchema.parse(mapped)
}

export { fromCatalogDocumentTemplatesRow }
