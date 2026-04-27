// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  GeneratedDocumentsDTOSchema,
  type GeneratedDocumentsDTO,
} from "@workspace/supabase-data/modules/documents/domain/dto/generated-documents.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type GeneratedDocumentsRow = Database["public"]["Tables"]["generated_documents"]["Row"]
type GeneratedDocumentsInsert = Database["public"]["Tables"]["generated_documents"]["Insert"]
type GeneratedDocumentsUpdate = Database["public"]["Tables"]["generated_documents"]["Update"]

const GeneratedDocumentsFieldMappings = {
  content: "content",
  createdAt: "created_at",
  createdBy: "created_by",
  documentType: "document_type",
  encodedContent: "encoded_content",
  id: "id",
  isArchived: "is_archived",
  patientId: "patient_id",
  psychologistClientId: "psychologist_client_id",
  psychologistId: "psychologist_id",
  tags: "tags",
  templateId: "template_id",
  title: "title",
  updatedAt: "updated_at",
  updatedBy: "updated_by",
} as const

type GeneratedDocumentsField = keyof typeof GeneratedDocumentsFieldMappings

function fromGeneratedDocumentsRow(row: GeneratedDocumentsRow): GeneratedDocumentsDTO {
  const mapped = {
    content: row.content,
    createdAt: row.created_at,
    createdBy: row.created_by,
    documentType: row.document_type,
    encodedContent: row.encoded_content,
    id: row.id,
    isArchived: row.is_archived,
    patientId: row.patient_id,
    psychologistClientId: row.psychologist_client_id,
    psychologistId: row.psychologist_id,
    tags: row.tags,
    templateId: row.template_id,
    title: row.title,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  }
  return GeneratedDocumentsDTOSchema.parse(mapped)
}

function toGeneratedDocumentsInsert(dto: Partial<GeneratedDocumentsDTO>): GeneratedDocumentsInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(GeneratedDocumentsFieldMappings) as Array<
    [GeneratedDocumentsField, (typeof GeneratedDocumentsFieldMappings)[GeneratedDocumentsField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as GeneratedDocumentsInsert
}

function toGeneratedDocumentsUpdate(dto: Partial<GeneratedDocumentsDTO>): GeneratedDocumentsUpdate {
  return toGeneratedDocumentsInsert(dto) as GeneratedDocumentsUpdate
}

export { fromGeneratedDocumentsRow, toGeneratedDocumentsInsert, toGeneratedDocumentsUpdate }
