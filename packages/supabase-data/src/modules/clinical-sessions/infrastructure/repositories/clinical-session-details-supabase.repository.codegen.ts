// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { ClinicalSessionDetailsDTO } from "@workspace/supabase-data/modules/clinical-sessions/domain/dto/clinical-session-details.dto.codegen"
import type {
  ClinicalSessionDetailsRepository,
  ClinicalSessionDetailsListParams,
  ClinicalSessionDetailsListResult,
} from "@workspace/supabase-data/modules/clinical-sessions/domain/ports/clinical-session-details-repository.port.codegen"
import {
  fromClinicalSessionDetailsRow,
  toClinicalSessionDetailsInsert,
  toClinicalSessionDetailsUpdate,
} from "@workspace/supabase-data/modules/clinical-sessions/infrastructure/mappers/clinical-session-details.mapper.codegen"

class ClinicalSessionDetailsSupabaseRepository implements ClinicalSessionDetailsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<ClinicalSessionDetailsDTO | null> {
    const { data, error } = await this.supabase
      .from("clinical_session_details")
      .select(
        "attendance_confirmed, billing_attempt_count, billing_last_attempt_at, billing_last_error, billing_next_attempt_at, billing_status, calendar_event_id, clinical_session_id, confirmation_sent_at, created_at, id, patient_id, psychologist_client_id, psychologist_service_id, reminder_sent_at, session_number, session_type_id, updated_at"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load clinical_session_details.", {
        cause: error,
      })
    }
    if (!data) return null
    return fromClinicalSessionDetailsRow(data)
  }

  async list(params: ClinicalSessionDetailsListParams): Promise<ClinicalSessionDetailsListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("clinical_session_details")
      .select(
        "attendance_confirmed, billing_attempt_count, billing_last_attempt_at, billing_last_error, billing_next_attempt_at, billing_status, calendar_event_id, clinical_session_id, confirmation_sent_at, created_at, id, patient_id, psychologist_client_id, psychologist_service_id, reminder_sent_at, session_number, session_type_id, updated_at"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list clinical_session_details.", {
        cause: error,
      })
    }
    const rows = (data ?? []).map((row) => fromClinicalSessionDetailsRow(row))
    return { rows }
  }

  async insert(data: Partial<ClinicalSessionDetailsDTO>): Promise<ClinicalSessionDetailsDTO> {
    const payload = toClinicalSessionDetailsInsert(data)
    const { data: row, error } = await this.supabase
      .from("clinical_session_details")
      .insert(payload)
      .select(
        "attendance_confirmed, billing_attempt_count, billing_last_attempt_at, billing_last_error, billing_next_attempt_at, billing_status, calendar_event_id, clinical_session_id, confirmation_sent_at, created_at, id, patient_id, psychologist_client_id, psychologist_service_id, reminder_sent_at, session_number, session_type_id, updated_at"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert clinical_session_details.", {
        cause: error,
      })
    }
    return fromClinicalSessionDetailsRow(row)
  }

  async update(
    id: string,
    patch: Partial<ClinicalSessionDetailsDTO>
  ): Promise<ClinicalSessionDetailsDTO> {
    const payload = toClinicalSessionDetailsUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("clinical_session_details")
      .update(payload)
      .eq("id", id)
      .select(
        "attendance_confirmed, billing_attempt_count, billing_last_attempt_at, billing_last_error, billing_next_attempt_at, billing_status, calendar_event_id, clinical_session_id, confirmation_sent_at, created_at, id, patient_id, psychologist_client_id, psychologist_service_id, reminder_sent_at, session_number, session_type_id, updated_at"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update clinical_session_details.", {
        cause: error,
      })
    }
    return fromClinicalSessionDetailsRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("clinical_session_details").delete().eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete clinical_session_details.", {
        cause: error,
      })
    }
  }
}

export { ClinicalSessionDetailsSupabaseRepository }
