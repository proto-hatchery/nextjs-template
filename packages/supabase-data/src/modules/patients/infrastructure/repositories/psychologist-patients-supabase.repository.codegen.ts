// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { PsychologistPatientsDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patients.dto.codegen"
import type {
  PsychologistPatientsRepository,
  PsychologistPatientsListParams,
  PsychologistPatientsListResult,
} from "@workspace/supabase-data/modules/patients/domain/ports/psychologist-patients-repository.port.codegen"
import {
  fromPsychologistPatientsRow,
  toPsychologistPatientsInsert,
  toPsychologistPatientsUpdate,
} from "@workspace/supabase-data/modules/patients/infrastructure/mappers/psychologist-patients.mapper.codegen"

class PsychologistPatientsSupabaseRepository implements PsychologistPatientsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<PsychologistPatientsDTO | null> {
    const { data, error } = await this.supabase
      .from("psychologist_patients")
      .select(
        "archived_at, archived_by, attached_documents, clinical_hypothesis, clinical_notes, created_at, created_by, current_medications, data_sharing_consent, data_sharing_consent_date, default_session_price, deleted_at, deleted_by, discharge_reason, disorders, first_session_date, id, informed_consent_date, informed_consent_document_url, informed_consent_signed, initial_complaint, invite_expires_at, invite_reminder_count, invite_reminder_sent_at, invite_sent_via, invite_status, invite_token, invited_at, is_minor, known_allergies, last_session_date, manual_address, manual_cpf, manual_date_of_birth, manual_display_name, manual_email, manual_emergency_contacts, manual_first_name, manual_full_name, manual_gender, manual_last_name, manual_patient_origin, manual_phone, manual_place_of_birth, manual_preferred_name, manual_profession, manual_pronouns, manual_rg, patient_id, preferred_contact_method, price_set_at, price_set_by, psychologist_id, recovery_deadline, relationship_end_date, relationship_start_date, requires_legal_guardian, retention_until, risk_level, status, suicide_risk_assessment, synced_address, synced_cpf, synced_date_of_birth, synced_display_name, synced_email, synced_full_name, synced_gender, synced_phone, synced_place_of_birth, synced_profession, synced_pronouns, synced_rg, therapeutic_goals, total_sessions_count, treatment_plan, updated_at, updated_by"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load psychologist_patients.", { cause: error })
    }
    if (!data) return null
    return fromPsychologistPatientsRow(data)
  }

  async list(params: PsychologistPatientsListParams): Promise<PsychologistPatientsListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("psychologist_patients")
      .select(
        "archived_at, archived_by, attached_documents, clinical_hypothesis, clinical_notes, created_at, created_by, current_medications, data_sharing_consent, data_sharing_consent_date, default_session_price, deleted_at, deleted_by, discharge_reason, disorders, first_session_date, id, informed_consent_date, informed_consent_document_url, informed_consent_signed, initial_complaint, invite_expires_at, invite_reminder_count, invite_reminder_sent_at, invite_sent_via, invite_status, invite_token, invited_at, is_minor, known_allergies, last_session_date, manual_address, manual_cpf, manual_date_of_birth, manual_display_name, manual_email, manual_emergency_contacts, manual_first_name, manual_full_name, manual_gender, manual_last_name, manual_patient_origin, manual_phone, manual_place_of_birth, manual_preferred_name, manual_profession, manual_pronouns, manual_rg, patient_id, preferred_contact_method, price_set_at, price_set_by, psychologist_id, recovery_deadline, relationship_end_date, relationship_start_date, requires_legal_guardian, retention_until, risk_level, status, suicide_risk_assessment, synced_address, synced_cpf, synced_date_of_birth, synced_display_name, synced_email, synced_full_name, synced_gender, synced_phone, synced_place_of_birth, synced_profession, synced_pronouns, synced_rg, therapeutic_goals, total_sessions_count, treatment_plan, updated_at, updated_by"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list psychologist_patients.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromPsychologistPatientsRow(row))
    return { rows }
  }

  async insert(data: Partial<PsychologistPatientsDTO>): Promise<PsychologistPatientsDTO> {
    const payload = toPsychologistPatientsInsert(data)
    const { data: row, error } = await this.supabase
      .from("psychologist_patients")
      .insert(payload)
      .select(
        "archived_at, archived_by, attached_documents, clinical_hypothesis, clinical_notes, created_at, created_by, current_medications, data_sharing_consent, data_sharing_consent_date, default_session_price, deleted_at, deleted_by, discharge_reason, disorders, first_session_date, id, informed_consent_date, informed_consent_document_url, informed_consent_signed, initial_complaint, invite_expires_at, invite_reminder_count, invite_reminder_sent_at, invite_sent_via, invite_status, invite_token, invited_at, is_minor, known_allergies, last_session_date, manual_address, manual_cpf, manual_date_of_birth, manual_display_name, manual_email, manual_emergency_contacts, manual_first_name, manual_full_name, manual_gender, manual_last_name, manual_patient_origin, manual_phone, manual_place_of_birth, manual_preferred_name, manual_profession, manual_pronouns, manual_rg, patient_id, preferred_contact_method, price_set_at, price_set_by, psychologist_id, recovery_deadline, relationship_end_date, relationship_start_date, requires_legal_guardian, retention_until, risk_level, status, suicide_risk_assessment, synced_address, synced_cpf, synced_date_of_birth, synced_display_name, synced_email, synced_full_name, synced_gender, synced_phone, synced_place_of_birth, synced_profession, synced_pronouns, synced_rg, therapeutic_goals, total_sessions_count, treatment_plan, updated_at, updated_by"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert psychologist_patients.", { cause: error })
    }
    return fromPsychologistPatientsRow(row)
  }

  async update(
    id: string,
    patch: Partial<PsychologistPatientsDTO>
  ): Promise<PsychologistPatientsDTO> {
    const payload = toPsychologistPatientsUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("psychologist_patients")
      .update(payload)
      .eq("id", id)
      .select(
        "archived_at, archived_by, attached_documents, clinical_hypothesis, clinical_notes, created_at, created_by, current_medications, data_sharing_consent, data_sharing_consent_date, default_session_price, deleted_at, deleted_by, discharge_reason, disorders, first_session_date, id, informed_consent_date, informed_consent_document_url, informed_consent_signed, initial_complaint, invite_expires_at, invite_reminder_count, invite_reminder_sent_at, invite_sent_via, invite_status, invite_token, invited_at, is_minor, known_allergies, last_session_date, manual_address, manual_cpf, manual_date_of_birth, manual_display_name, manual_email, manual_emergency_contacts, manual_first_name, manual_full_name, manual_gender, manual_last_name, manual_patient_origin, manual_phone, manual_place_of_birth, manual_preferred_name, manual_profession, manual_pronouns, manual_rg, patient_id, preferred_contact_method, price_set_at, price_set_by, psychologist_id, recovery_deadline, relationship_end_date, relationship_start_date, requires_legal_guardian, retention_until, risk_level, status, suicide_risk_assessment, synced_address, synced_cpf, synced_date_of_birth, synced_display_name, synced_email, synced_full_name, synced_gender, synced_phone, synced_place_of_birth, synced_profession, synced_pronouns, synced_rg, therapeutic_goals, total_sessions_count, treatment_plan, updated_at, updated_by"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update psychologist_patients.", { cause: error })
    }
    return fromPsychologistPatientsRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("psychologist_patients").delete().eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete psychologist_patients.", { cause: error })
    }
  }
}

export { PsychologistPatientsSupabaseRepository }
