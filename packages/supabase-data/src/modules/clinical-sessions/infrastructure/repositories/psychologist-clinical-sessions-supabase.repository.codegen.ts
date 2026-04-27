// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { PsychologistClinicalSessionsDTO } from "@workspace/supabase-data/modules/clinical-sessions/domain/dto/psychologist-clinical-sessions.dto.codegen"
import type {
  PsychologistClinicalSessionsRepository,
  PsychologistClinicalSessionsListParams,
  PsychologistClinicalSessionsListResult,
} from "@workspace/supabase-data/modules/clinical-sessions/domain/ports/psychologist-clinical-sessions-repository.port.codegen"
import {
  fromPsychologistClinicalSessionsRow,
  toPsychologistClinicalSessionsInsert,
  toPsychologistClinicalSessionsUpdate,
} from "@workspace/supabase-data/modules/clinical-sessions/infrastructure/mappers/psychologist-clinical-sessions.mapper.codegen"

class PsychologistClinicalSessionsSupabaseRepository implements PsychologistClinicalSessionsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<PsychologistClinicalSessionsDTO | null> {
    const { data, error } = await this.supabase
      .from("psychologist_clinical_sessions")
      .select(
        "attendance_confirmed, automation_metadata, billing_attempt_count, billing_last_error, billing_next_attempt_at, billing_status, calendar_event_id, confirmation_sent_at, created_at, created_by, custom_price_cents, default_charge_id, duration_minutes, id, location_id, note_id, notes, psychologist_id, psychologist_patient_id, psychologist_service_id, reminder_sent_at, session_number, snapshot_price, snapshot_price_cents, snapshot_service_name, start_time, status, status_reason, updated_at, updated_by"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load psychologist_clinical_sessions.", {
        cause: error,
      })
    }
    if (!data) return null
    return fromPsychologistClinicalSessionsRow(data)
  }

  async list(
    params: PsychologistClinicalSessionsListParams
  ): Promise<PsychologistClinicalSessionsListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("psychologist_clinical_sessions")
      .select(
        "attendance_confirmed, automation_metadata, billing_attempt_count, billing_last_error, billing_next_attempt_at, billing_status, calendar_event_id, confirmation_sent_at, created_at, created_by, custom_price_cents, default_charge_id, duration_minutes, id, location_id, note_id, notes, psychologist_id, psychologist_patient_id, psychologist_service_id, reminder_sent_at, session_number, snapshot_price, snapshot_price_cents, snapshot_service_name, start_time, status, status_reason, updated_at, updated_by"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list psychologist_clinical_sessions.", {
        cause: error,
      })
    }
    const rows = (data ?? []).map((row) => fromPsychologistClinicalSessionsRow(row))
    return { rows }
  }

  async insert(
    data: Partial<PsychologistClinicalSessionsDTO>
  ): Promise<PsychologistClinicalSessionsDTO> {
    const payload = toPsychologistClinicalSessionsInsert(data)
    const { data: row, error } = await this.supabase
      .from("psychologist_clinical_sessions")
      .insert(payload)
      .select(
        "attendance_confirmed, automation_metadata, billing_attempt_count, billing_last_error, billing_next_attempt_at, billing_status, calendar_event_id, confirmation_sent_at, created_at, created_by, custom_price_cents, default_charge_id, duration_minutes, id, location_id, note_id, notes, psychologist_id, psychologist_patient_id, psychologist_service_id, reminder_sent_at, session_number, snapshot_price, snapshot_price_cents, snapshot_service_name, start_time, status, status_reason, updated_at, updated_by"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert psychologist_clinical_sessions.", {
        cause: error,
      })
    }
    return fromPsychologistClinicalSessionsRow(row)
  }

  async update(
    id: string,
    patch: Partial<PsychologistClinicalSessionsDTO>
  ): Promise<PsychologistClinicalSessionsDTO> {
    const payload = toPsychologistClinicalSessionsUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("psychologist_clinical_sessions")
      .update(payload)
      .eq("id", id)
      .select(
        "attendance_confirmed, automation_metadata, billing_attempt_count, billing_last_error, billing_next_attempt_at, billing_status, calendar_event_id, confirmation_sent_at, created_at, created_by, custom_price_cents, default_charge_id, duration_minutes, id, location_id, note_id, notes, psychologist_id, psychologist_patient_id, psychologist_service_id, reminder_sent_at, session_number, snapshot_price, snapshot_price_cents, snapshot_service_name, start_time, status, status_reason, updated_at, updated_by"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update psychologist_clinical_sessions.", {
        cause: error,
      })
    }
    return fromPsychologistClinicalSessionsRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("psychologist_clinical_sessions")
      .delete()
      .eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete psychologist_clinical_sessions.", {
        cause: error,
      })
    }
  }
}

export { PsychologistClinicalSessionsSupabaseRepository }
