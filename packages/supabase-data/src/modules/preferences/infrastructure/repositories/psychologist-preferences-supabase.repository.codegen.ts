// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { PsychologistPreferencesDTO } from "@workspace/supabase-data/modules/preferences/domain/dto/psychologist-preferences.dto.codegen"
import type {
  PsychologistPreferencesRepository,
  PsychologistPreferencesListParams,
  PsychologistPreferencesListResult,
} from "@workspace/supabase-data/modules/preferences/domain/ports/psychologist-preferences-repository.port.codegen"
import {
  fromPsychologistPreferencesRow,
  toPsychologistPreferencesInsert,
  toPsychologistPreferencesUpdate,
} from "@workspace/supabase-data/modules/preferences/infrastructure/mappers/psychologist-preferences.mapper.codegen"

class PsychologistPreferencesSupabaseRepository implements PsychologistPreferencesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<PsychologistPreferencesDTO | null> {
    const { data, error } = await this.supabase
      .from("psychologist_preferences")
      .select(
        "created_at, id, notifications_billing_alerts, notifications_email_reminders, notifications_marketing, notifications_payment_receipts, notifications_security_alerts, notifications_whatsapp_reminders, preferences, updated_at, user_id"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load psychologist_preferences.", {
        cause: error,
      })
    }
    if (!data) return null
    return fromPsychologistPreferencesRow(data)
  }

  async list(
    params: PsychologistPreferencesListParams
  ): Promise<PsychologistPreferencesListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("psychologist_preferences")
      .select(
        "created_at, id, notifications_billing_alerts, notifications_email_reminders, notifications_marketing, notifications_payment_receipts, notifications_security_alerts, notifications_whatsapp_reminders, preferences, updated_at, user_id"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list psychologist_preferences.", {
        cause: error,
      })
    }
    const rows = (data ?? []).map((row) => fromPsychologistPreferencesRow(row))
    return { rows }
  }

  async insert(data: Partial<PsychologistPreferencesDTO>): Promise<PsychologistPreferencesDTO> {
    const payload = toPsychologistPreferencesInsert(data)
    const { data: row, error } = await this.supabase
      .from("psychologist_preferences")
      .insert(payload)
      .select(
        "created_at, id, notifications_billing_alerts, notifications_email_reminders, notifications_marketing, notifications_payment_receipts, notifications_security_alerts, notifications_whatsapp_reminders, preferences, updated_at, user_id"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert psychologist_preferences.", {
        cause: error,
      })
    }
    return fromPsychologistPreferencesRow(row)
  }

  async update(
    id: string,
    patch: Partial<PsychologistPreferencesDTO>
  ): Promise<PsychologistPreferencesDTO> {
    const payload = toPsychologistPreferencesUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("psychologist_preferences")
      .update(payload)
      .eq("id", id)
      .select(
        "created_at, id, notifications_billing_alerts, notifications_email_reminders, notifications_marketing, notifications_payment_receipts, notifications_security_alerts, notifications_whatsapp_reminders, preferences, updated_at, user_id"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update psychologist_preferences.", {
        cause: error,
      })
    }
    return fromPsychologistPreferencesRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("psychologist_preferences").delete().eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete psychologist_preferences.", {
        cause: error,
      })
    }
  }
}

export { PsychologistPreferencesSupabaseRepository }
