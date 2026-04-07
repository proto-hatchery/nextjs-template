// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { Database } from "@workspace/supabase-infra/types/database"

import { CatalogDocumentTemplatesDTOSchema, type CatalogDocumentTemplatesDTO } from "@workspace/supabase-data/modules/catalog/domain/dto/catalog-document-templates.dto.codegen"

type CatalogDocumentTemplatesRow = Database["public"]["Tables"]["catalog_document_templates"]["Row"]
type CatalogDocumentTemplatesInsert = Database["public"]["Tables"]["catalog_document_templates"]["Insert"]
type CatalogDocumentTemplatesUpdate = Database["public"]["Tables"]["catalog_document_templates"]["Update"]

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

type CatalogDocumentTemplatesField = keyof typeof CatalogDocumentTemplatesFieldMappings

function fromCatalogDocumentTemplatesRow(row: CatalogDocumentTemplatesRow): CatalogDocumentTemplatesDTO {
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

function toCatalogDocumentTemplatesInsert(dto: Partial<CatalogDocumentTemplatesDTO>): CatalogDocumentTemplatesInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(CatalogDocumentTemplatesFieldMappings) as Array<
    [CatalogDocumentTemplatesField, (typeof CatalogDocumentTemplatesFieldMappings)[CatalogDocumentTemplatesField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as CatalogDocumentTemplatesInsert
}

function toCatalogDocumentTemplatesUpdate(dto: Partial<CatalogDocumentTemplatesDTO>): CatalogDocumentTemplatesUpdate {
  return toCatalogDocumentTemplatesInsert(dto) as CatalogDocumentTemplatesUpdate
}

export { fromCatalogDocumentTemplatesRow, toCatalogDocumentTemplatesInsert, toCatalogDocumentTemplatesUpdate }
