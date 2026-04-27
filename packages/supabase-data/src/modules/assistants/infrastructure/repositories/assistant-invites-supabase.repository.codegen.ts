// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { AssistantInvitesDTO } from "@workspace/supabase-data/modules/assistants/domain/dto/assistant-invites.dto.codegen"
import type {
  AssistantInvitesRepository,
  AssistantInvitesListParams,
  AssistantInvitesListResult,
} from "@workspace/supabase-data/modules/assistants/domain/ports/assistant-invites-repository.port.codegen"
import {
  fromAssistantInvitesRow,
  toAssistantInvitesInsert,
  toAssistantInvitesUpdate,
} from "@workspace/supabase-data/modules/assistants/infrastructure/mappers/assistant-invites.mapper.codegen"

class AssistantInvitesSupabaseRepository implements AssistantInvitesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<AssistantInvitesDTO | null> {
    const { data, error } = await this.supabase
      .from("assistant_invites")
      .select(
        "accepted_at, created_at, expires_at, id, invited_email, invited_phone, metadata, psychologist_id, revoked_at, updated_at"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load assistant_invites.", { cause: error })
    }
    if (!data) return null
    return fromAssistantInvitesRow(data)
  }

  async list(params: AssistantInvitesListParams): Promise<AssistantInvitesListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("assistant_invites")
      .select(
        "accepted_at, created_at, expires_at, id, invited_email, invited_phone, metadata, psychologist_id, revoked_at, updated_at"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list assistant_invites.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromAssistantInvitesRow(row))
    return { rows }
  }

  async insert(data: Partial<AssistantInvitesDTO>): Promise<AssistantInvitesDTO> {
    const payload = toAssistantInvitesInsert(data)
    const { data: row, error } = await this.supabase
      .from("assistant_invites")
      .insert(payload)
      .select(
        "accepted_at, created_at, expires_at, id, invited_email, invited_phone, metadata, psychologist_id, revoked_at, updated_at"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert assistant_invites.", { cause: error })
    }
    return fromAssistantInvitesRow(row)
  }

  async update(id: string, patch: Partial<AssistantInvitesDTO>): Promise<AssistantInvitesDTO> {
    const payload = toAssistantInvitesUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("assistant_invites")
      .update(payload)
      .eq("id", id)
      .select(
        "accepted_at, created_at, expires_at, id, invited_email, invited_phone, metadata, psychologist_id, revoked_at, updated_at"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update assistant_invites.", { cause: error })
    }
    return fromAssistantInvitesRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("assistant_invites").delete().eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete assistant_invites.", { cause: error })
    }
  }
}

export { AssistantInvitesSupabaseRepository }
