// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { PsychologistQuickNotesDTO } from "@workspace/supabase-data/modules/notes/domain/dto/psychologist-quick-notes.dto.codegen"
import type {
  PsychologistQuickNotesRepository,
  PsychologistQuickNotesListParams,
  PsychologistQuickNotesListResult,
} from "@workspace/supabase-data/modules/notes/domain/ports/psychologist-quick-notes-repository.port.codegen"
import {
  fromPsychologistQuickNotesRow,
  toPsychologistQuickNotesInsert,
  toPsychologistQuickNotesUpdate,
} from "@workspace/supabase-data/modules/notes/infrastructure/mappers/psychologist-quick-notes.mapper.codegen"

class PsychologistQuickNotesSupabaseRepository implements PsychologistQuickNotesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<PsychologistQuickNotesDTO | null> {
    const { data, error } = await this.supabase
      .from("psychologist_quick_notes")
      .select(
        "completed_at, created_at, due_date, id, is_completed, priority, psychologist_id, title, updated_at"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load psychologist_quick_notes.", {
        cause: error,
      })
    }
    if (!data) return null
    return fromPsychologistQuickNotesRow(data)
  }

  async list(params: PsychologistQuickNotesListParams): Promise<PsychologistQuickNotesListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("psychologist_quick_notes")
      .select(
        "completed_at, created_at, due_date, id, is_completed, priority, psychologist_id, title, updated_at"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list psychologist_quick_notes.", {
        cause: error,
      })
    }
    const rows = (data ?? []).map((row) => fromPsychologistQuickNotesRow(row))
    return { rows }
  }

  async insert(data: Partial<PsychologistQuickNotesDTO>): Promise<PsychologistQuickNotesDTO> {
    const payload = toPsychologistQuickNotesInsert(data)
    const { data: row, error } = await this.supabase
      .from("psychologist_quick_notes")
      .insert(payload)
      .select(
        "completed_at, created_at, due_date, id, is_completed, priority, psychologist_id, title, updated_at"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert psychologist_quick_notes.", {
        cause: error,
      })
    }
    return fromPsychologistQuickNotesRow(row)
  }

  async update(
    id: string,
    patch: Partial<PsychologistQuickNotesDTO>
  ): Promise<PsychologistQuickNotesDTO> {
    const payload = toPsychologistQuickNotesUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("psychologist_quick_notes")
      .update(payload)
      .eq("id", id)
      .select(
        "completed_at, created_at, due_date, id, is_completed, priority, psychologist_id, title, updated_at"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update psychologist_quick_notes.", {
        cause: error,
      })
    }
    return fromPsychologistQuickNotesRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("psychologist_quick_notes").delete().eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete psychologist_quick_notes.", {
        cause: error,
      })
    }
  }
}

export { PsychologistQuickNotesSupabaseRepository }
