// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { PsychologistNotesDTO } from "@workspace/supabase-data/modules/notes/domain/dto/psychologist-notes.dto.codegen"
import type {
  PsychologistNotesRepository,
  PsychologistNotesListParams,
  PsychologistNotesListResult,
} from "@workspace/supabase-data/modules/notes/domain/ports/psychologist-notes-repository.port.codegen"
import {
  fromPsychologistNotesRow,
  toPsychologistNotesInsert,
  toPsychologistNotesUpdate,
} from "@workspace/supabase-data/modules/notes/infrastructure/mappers/psychologist-notes.mapper.codegen"

class PsychologistNotesSupabaseRepository implements PsychologistNotesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<PsychologistNotesDTO | null> {
    const { data, error } = await this.supabase
      .from("psychologist_notes")
      .select(
        "content, created_at, created_by, encoded_content, id, is_archived, note_type, parent_note_id, patient_id, psychologist_client_id, psychologist_id, session_id, tags, title, updated_at"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load psychologist_notes.", { cause: error })
    }
    if (!data) return null
    return fromPsychologistNotesRow(data)
  }

  async list(params: PsychologistNotesListParams): Promise<PsychologistNotesListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("psychologist_notes")
      .select(
        "content, created_at, created_by, encoded_content, id, is_archived, note_type, parent_note_id, patient_id, psychologist_client_id, psychologist_id, session_id, tags, title, updated_at"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list psychologist_notes.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromPsychologistNotesRow(row))
    return { rows }
  }

  async insert(data: Partial<PsychologistNotesDTO>): Promise<PsychologistNotesDTO> {
    const payload = toPsychologistNotesInsert(data)
    const { data: row, error } = await this.supabase
      .from("psychologist_notes")
      .insert(payload)
      .select(
        "content, created_at, created_by, encoded_content, id, is_archived, note_type, parent_note_id, patient_id, psychologist_client_id, psychologist_id, session_id, tags, title, updated_at"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert psychologist_notes.", { cause: error })
    }
    return fromPsychologistNotesRow(row)
  }

  async update(id: string, patch: Partial<PsychologistNotesDTO>): Promise<PsychologistNotesDTO> {
    const payload = toPsychologistNotesUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("psychologist_notes")
      .update(payload)
      .eq("id", id)
      .select(
        "content, created_at, created_by, encoded_content, id, is_archived, note_type, parent_note_id, patient_id, psychologist_client_id, psychologist_id, session_id, tags, title, updated_at"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update psychologist_notes.", { cause: error })
    }
    return fromPsychologistNotesRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("psychologist_notes").delete().eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete psychologist_notes.", { cause: error })
    }
  }
}

export { PsychologistNotesSupabaseRepository }
