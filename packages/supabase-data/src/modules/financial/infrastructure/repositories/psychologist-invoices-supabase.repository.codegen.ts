// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { PsychologistInvoicesDTO } from "@workspace/supabase-data/modules/financial/domain/dto/psychologist-invoices.dto.codegen"
import type {
  PsychologistInvoicesRepository,
  PsychologistInvoicesListParams,
  PsychologistInvoicesListResult,
} from "@workspace/supabase-data/modules/financial/domain/ports/psychologist-invoices-repository.port.codegen"
import {
  fromPsychologistInvoicesRow,
  toPsychologistInvoicesInsert,
  toPsychologistInvoicesUpdate,
} from "@workspace/supabase-data/modules/financial/infrastructure/mappers/psychologist-invoices.mapper.codegen"

class PsychologistInvoicesSupabaseRepository implements PsychologistInvoicesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<PsychologistInvoicesDTO | null> {
    const { data, error } = await this.supabase
      .from("psychologist_invoices")
      .select(
        "amount_paid, created_at, currency, hosted_invoice_url, id, invoice_pdf, period_end, period_start, psychologist_id, status, stripe_invoice_id, stripe_subscription_id, updated_at"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load psychologist_invoices.", { cause: error })
    }
    if (!data) return null
    return fromPsychologistInvoicesRow(data)
  }

  async list(params: PsychologistInvoicesListParams): Promise<PsychologistInvoicesListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("psychologist_invoices")
      .select(
        "amount_paid, created_at, currency, hosted_invoice_url, id, invoice_pdf, period_end, period_start, psychologist_id, status, stripe_invoice_id, stripe_subscription_id, updated_at"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list psychologist_invoices.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromPsychologistInvoicesRow(row))
    return { rows }
  }

  async insert(data: Partial<PsychologistInvoicesDTO>): Promise<PsychologistInvoicesDTO> {
    const payload = toPsychologistInvoicesInsert(data)
    const { data: row, error } = await this.supabase
      .from("psychologist_invoices")
      .insert(payload)
      .select(
        "amount_paid, created_at, currency, hosted_invoice_url, id, invoice_pdf, period_end, period_start, psychologist_id, status, stripe_invoice_id, stripe_subscription_id, updated_at"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert psychologist_invoices.", { cause: error })
    }
    return fromPsychologistInvoicesRow(row)
  }

  async update(
    id: string,
    patch: Partial<PsychologistInvoicesDTO>
  ): Promise<PsychologistInvoicesDTO> {
    const payload = toPsychologistInvoicesUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("psychologist_invoices")
      .update(payload)
      .eq("id", id)
      .select(
        "amount_paid, created_at, currency, hosted_invoice_url, id, invoice_pdf, period_end, period_start, psychologist_id, status, stripe_invoice_id, stripe_subscription_id, updated_at"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update psychologist_invoices.", { cause: error })
    }
    return fromPsychologistInvoicesRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("psychologist_invoices").delete().eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete psychologist_invoices.", { cause: error })
    }
  }
}

export { PsychologistInvoicesSupabaseRepository }
