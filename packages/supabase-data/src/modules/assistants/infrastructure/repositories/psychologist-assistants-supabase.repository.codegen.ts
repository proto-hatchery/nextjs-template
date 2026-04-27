// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { PsychologistAssistantsDTO } from "@workspace/supabase-data/modules/assistants/domain/dto/psychologist-assistants.dto.codegen"
import type {
  PsychologistAssistantsRepository,
  PsychologistAssistantsListParams,
  PsychologistAssistantsListResult,
} from "@workspace/supabase-data/modules/assistants/domain/ports/psychologist-assistants-repository.port.codegen"
import {
  fromPsychologistAssistantsRow,
  toPsychologistAssistantsInsert,
  toPsychologistAssistantsUpdate,
} from "@workspace/supabase-data/modules/assistants/infrastructure/mappers/psychologist-assistants.mapper.codegen"

class PsychologistAssistantsSupabaseRepository implements PsychologistAssistantsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async list(params: PsychologistAssistantsListParams): Promise<PsychologistAssistantsListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("psychologist_assistants")
      .select("assistant_id, created_at, metadata, psychologist_id, revoked_at")
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list psychologist_assistants.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromPsychologistAssistantsRow(row))
    return { rows }
  }

  async insert(data: Partial<PsychologistAssistantsDTO>): Promise<PsychologistAssistantsDTO> {
    const payload = toPsychologistAssistantsInsert(data)
    const { data: row, error } = await this.supabase
      .from("psychologist_assistants")
      .insert(payload)
      .select("assistant_id, created_at, metadata, psychologist_id, revoked_at")
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert psychologist_assistants.", {
        cause: error,
      })
    }
    return fromPsychologistAssistantsRow(row)
  }

  async update(
    id: string,
    patch: Partial<PsychologistAssistantsDTO>
  ): Promise<PsychologistAssistantsDTO> {
    const payload = toPsychologistAssistantsUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("psychologist_assistants")
      .update(payload)
      .eq("id", id)
      .select("assistant_id, created_at, metadata, psychologist_id, revoked_at")
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update psychologist_assistants.", {
        cause: error,
      })
    }
    return fromPsychologistAssistantsRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("psychologist_assistants").delete().eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete psychologist_assistants.", {
        cause: error,
      })
    }
  }
}

export { PsychologistAssistantsSupabaseRepository }
