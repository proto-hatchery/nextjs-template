// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { GeneratedDocumentsDTO } from "@workspace/supabase-data/modules/documents/domain/dto/generated-documents.dto.codegen"
import type {
  GeneratedDocumentsRepository,
  GeneratedDocumentsListParams,
  GeneratedDocumentsListResult,
} from "@workspace/supabase-data/modules/documents/domain/ports/generated-documents-repository.port.codegen"
import {
  fromGeneratedDocumentsRow,
  toGeneratedDocumentsInsert,
  toGeneratedDocumentsUpdate,
} from "@workspace/supabase-data/modules/documents/infrastructure/mappers/generated-documents.mapper.codegen"

class GeneratedDocumentsSupabaseRepository implements GeneratedDocumentsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<GeneratedDocumentsDTO | null> {
    const { data, error } = await this.supabase
      .from("generated_documents")
      .select(
        "content, created_at, created_by, document_type, encoded_content, id, is_archived, patient_id, psychologist_client_id, psychologist_id, tags, template_id, title, updated_at, updated_by"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load generated_documents.", { cause: error })
    }
    if (!data) return null
    return fromGeneratedDocumentsRow(data)
  }

  async list(params: GeneratedDocumentsListParams): Promise<GeneratedDocumentsListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("generated_documents")
      .select(
        "content, created_at, created_by, document_type, encoded_content, id, is_archived, patient_id, psychologist_client_id, psychologist_id, tags, template_id, title, updated_at, updated_by"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list generated_documents.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromGeneratedDocumentsRow(row))
    return { rows }
  }

  async insert(data: Partial<GeneratedDocumentsDTO>): Promise<GeneratedDocumentsDTO> {
    const payload = toGeneratedDocumentsInsert(data)
    const { data: row, error } = await this.supabase
      .from("generated_documents")
      .insert(payload)
      .select(
        "content, created_at, created_by, document_type, encoded_content, id, is_archived, patient_id, psychologist_client_id, psychologist_id, tags, template_id, title, updated_at, updated_by"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert generated_documents.", { cause: error })
    }
    return fromGeneratedDocumentsRow(row)
  }

  async update(id: string, patch: Partial<GeneratedDocumentsDTO>): Promise<GeneratedDocumentsDTO> {
    const payload = toGeneratedDocumentsUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("generated_documents")
      .update(payload)
      .eq("id", id)
      .select(
        "content, created_at, created_by, document_type, encoded_content, id, is_archived, patient_id, psychologist_client_id, psychologist_id, tags, template_id, title, updated_at, updated_by"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update generated_documents.", { cause: error })
    }
    return fromGeneratedDocumentsRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("generated_documents").delete().eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete generated_documents.", { cause: error })
    }
  }
}

export { GeneratedDocumentsSupabaseRepository }
