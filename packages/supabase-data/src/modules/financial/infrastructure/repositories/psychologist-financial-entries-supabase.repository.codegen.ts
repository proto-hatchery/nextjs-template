// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { PsychologistFinancialEntriesDTO } from "@workspace/supabase-data/modules/financial/domain/dto/psychologist-financial-entries.dto.codegen"
import type {
  PsychologistFinancialEntriesRepository,
  PsychologistFinancialEntriesListParams,
  PsychologistFinancialEntriesListResult,
} from "@workspace/supabase-data/modules/financial/domain/ports/psychologist-financial-entries-repository.port.codegen"
import {
  fromPsychologistFinancialEntriesRow,
  toPsychologistFinancialEntriesInsert,
  toPsychologistFinancialEntriesUpdate,
} from "@workspace/supabase-data/modules/financial/infrastructure/mappers/psychologist-financial-entries.mapper.codegen"

class PsychologistFinancialEntriesSupabaseRepository implements PsychologistFinancialEntriesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<PsychologistFinancialEntriesDTO | null> {
    const { data, error } = await this.supabase
      .from("psychologist_financial_entries")
      .select(
        "amount, attachment_url, billing_id, charge_id, charges_count, consolidation_type, created_at, created_by, date_time, description, id, is_automatically_generated, notes, parent_recurrence_id, payment_method, psychologist_id, session_id, status, transaction_category_id, type, updated_at, updated_by, weekly_period_end, weekly_period_start"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load psychologist_financial_entries.", {
        cause: error,
      })
    }
    if (!data) return null
    return fromPsychologistFinancialEntriesRow(data)
  }

  async list(
    params: PsychologistFinancialEntriesListParams
  ): Promise<PsychologistFinancialEntriesListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("psychologist_financial_entries")
      .select(
        "amount, attachment_url, billing_id, charge_id, charges_count, consolidation_type, created_at, created_by, date_time, description, id, is_automatically_generated, notes, parent_recurrence_id, payment_method, psychologist_id, session_id, status, transaction_category_id, type, updated_at, updated_by, weekly_period_end, weekly_period_start"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list psychologist_financial_entries.", {
        cause: error,
      })
    }
    const rows = (data ?? []).map((row) => fromPsychologistFinancialEntriesRow(row))
    return { rows }
  }

  async insert(
    data: Partial<PsychologistFinancialEntriesDTO>
  ): Promise<PsychologistFinancialEntriesDTO> {
    const payload = toPsychologistFinancialEntriesInsert(data)
    const { data: row, error } = await this.supabase
      .from("psychologist_financial_entries")
      .insert(payload)
      .select(
        "amount, attachment_url, billing_id, charge_id, charges_count, consolidation_type, created_at, created_by, date_time, description, id, is_automatically_generated, notes, parent_recurrence_id, payment_method, psychologist_id, session_id, status, transaction_category_id, type, updated_at, updated_by, weekly_period_end, weekly_period_start"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert psychologist_financial_entries.", {
        cause: error,
      })
    }
    return fromPsychologistFinancialEntriesRow(row)
  }

  async update(
    id: string,
    patch: Partial<PsychologistFinancialEntriesDTO>
  ): Promise<PsychologistFinancialEntriesDTO> {
    const payload = toPsychologistFinancialEntriesUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("psychologist_financial_entries")
      .update(payload)
      .eq("id", id)
      .select(
        "amount, attachment_url, billing_id, charge_id, charges_count, consolidation_type, created_at, created_by, date_time, description, id, is_automatically_generated, notes, parent_recurrence_id, payment_method, psychologist_id, session_id, status, transaction_category_id, type, updated_at, updated_by, weekly_period_end, weekly_period_start"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update psychologist_financial_entries.", {
        cause: error,
      })
    }
    return fromPsychologistFinancialEntriesRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("psychologist_financial_entries")
      .delete()
      .eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete psychologist_financial_entries.", {
        cause: error,
      })
    }
  }
}

export { PsychologistFinancialEntriesSupabaseRepository }
