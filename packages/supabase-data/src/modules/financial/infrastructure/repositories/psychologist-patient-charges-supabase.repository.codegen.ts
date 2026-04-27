// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { PsychologistPatientChargesDTO } from "@workspace/supabase-data/modules/financial/domain/dto/psychologist-patient-charges.dto.codegen"
import type {
  PsychologistPatientChargesRepository,
  PsychologistPatientChargesListParams,
  PsychologistPatientChargesListResult,
} from "@workspace/supabase-data/modules/financial/domain/ports/psychologist-patient-charges-repository.port.codegen"
import {
  fromPsychologistPatientChargesRow,
  toPsychologistPatientChargesInsert,
  toPsychologistPatientChargesUpdate,
} from "@workspace/supabase-data/modules/financial/infrastructure/mappers/psychologist-patient-charges.mapper.codegen"

class PsychologistPatientChargesSupabaseRepository implements PsychologistPatientChargesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<PsychologistPatientChargesDTO | null> {
    const { data, error } = await this.supabase
      .from("psychologist_patient_charges")
      .select(
        "attachment_url, created_at, created_by, description, document_status, due_date, id, invoice_number, invoice_url, last_sent_at, paid_at, payment_method, payment_notes, payment_status, price_cents, psychologist_id, psychologist_patient_id, sent_count, session_id, updated_at, updated_by"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load psychologist_patient_charges.", {
        cause: error,
      })
    }
    if (!data) return null
    return fromPsychologistPatientChargesRow(data)
  }

  async list(
    params: PsychologistPatientChargesListParams
  ): Promise<PsychologistPatientChargesListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("psychologist_patient_charges")
      .select(
        "attachment_url, created_at, created_by, description, document_status, due_date, id, invoice_number, invoice_url, last_sent_at, paid_at, payment_method, payment_notes, payment_status, price_cents, psychologist_id, psychologist_patient_id, sent_count, session_id, updated_at, updated_by"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list psychologist_patient_charges.", {
        cause: error,
      })
    }
    const rows = (data ?? []).map((row) => fromPsychologistPatientChargesRow(row))
    return { rows }
  }

  async insert(
    data: Partial<PsychologistPatientChargesDTO>
  ): Promise<PsychologistPatientChargesDTO> {
    const payload = toPsychologistPatientChargesInsert(data)
    const { data: row, error } = await this.supabase
      .from("psychologist_patient_charges")
      .insert(payload)
      .select(
        "attachment_url, created_at, created_by, description, document_status, due_date, id, invoice_number, invoice_url, last_sent_at, paid_at, payment_method, payment_notes, payment_status, price_cents, psychologist_id, psychologist_patient_id, sent_count, session_id, updated_at, updated_by"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert psychologist_patient_charges.", {
        cause: error,
      })
    }
    return fromPsychologistPatientChargesRow(row)
  }

  async update(
    id: string,
    patch: Partial<PsychologistPatientChargesDTO>
  ): Promise<PsychologistPatientChargesDTO> {
    const payload = toPsychologistPatientChargesUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("psychologist_patient_charges")
      .update(payload)
      .eq("id", id)
      .select(
        "attachment_url, created_at, created_by, description, document_status, due_date, id, invoice_number, invoice_url, last_sent_at, paid_at, payment_method, payment_notes, payment_status, price_cents, psychologist_id, psychologist_patient_id, sent_count, session_id, updated_at, updated_by"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update psychologist_patient_charges.", {
        cause: error,
      })
    }
    return fromPsychologistPatientChargesRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("psychologist_patient_charges").delete().eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete psychologist_patient_charges.", {
        cause: error,
      })
    }
  }
}

export { PsychologistPatientChargesSupabaseRepository }
