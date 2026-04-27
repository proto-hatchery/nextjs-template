// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { PsychologistPatientEmergencyContactsDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-emergency-contacts.dto.codegen"
import type {
  PsychologistPatientEmergencyContactsRepository,
  PsychologistPatientEmergencyContactsListParams,
  PsychologistPatientEmergencyContactsListResult,
} from "@workspace/supabase-data/modules/patients/domain/ports/psychologist-patient-emergency-contacts-repository.port.codegen"
import {
  fromPsychologistPatientEmergencyContactsRow,
  toPsychologistPatientEmergencyContactsInsert,
  toPsychologistPatientEmergencyContactsUpdate,
} from "@workspace/supabase-data/modules/patients/infrastructure/mappers/psychologist-patient-emergency-contacts.mapper.codegen"

class PsychologistPatientEmergencyContactsSupabaseRepository implements PsychologistPatientEmergencyContactsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<PsychologistPatientEmergencyContactsDTO | null> {
    const { data, error } = await this.supabase
      .from("psychologist_patient_emergency_contacts")
      .select(
        "contact_name, created_at, created_by, email, id, is_primary, notes, phone, psychologist_patient_id, relationship, updated_at, updated_by"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load psychologist_patient_emergency_contacts.", {
        cause: error,
      })
    }
    if (!data) return null
    return fromPsychologistPatientEmergencyContactsRow(data)
  }

  async list(
    params: PsychologistPatientEmergencyContactsListParams
  ): Promise<PsychologistPatientEmergencyContactsListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("psychologist_patient_emergency_contacts")
      .select(
        "contact_name, created_at, created_by, email, id, is_primary, notes, phone, psychologist_patient_id, relationship, updated_at, updated_by"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list psychologist_patient_emergency_contacts.", {
        cause: error,
      })
    }
    const rows = (data ?? []).map((row) => fromPsychologistPatientEmergencyContactsRow(row))
    return { rows }
  }

  async insert(
    data: Partial<PsychologistPatientEmergencyContactsDTO>
  ): Promise<PsychologistPatientEmergencyContactsDTO> {
    const payload = toPsychologistPatientEmergencyContactsInsert(data)
    const { data: row, error } = await this.supabase
      .from("psychologist_patient_emergency_contacts")
      .insert(payload)
      .select(
        "contact_name, created_at, created_by, email, id, is_primary, notes, phone, psychologist_patient_id, relationship, updated_at, updated_by"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError(
        "Failed to insert psychologist_patient_emergency_contacts.",
        { cause: error }
      )
    }
    return fromPsychologistPatientEmergencyContactsRow(row)
  }

  async update(
    id: string,
    patch: Partial<PsychologistPatientEmergencyContactsDTO>
  ): Promise<PsychologistPatientEmergencyContactsDTO> {
    const payload = toPsychologistPatientEmergencyContactsUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("psychologist_patient_emergency_contacts")
      .update(payload)
      .eq("id", id)
      .select(
        "contact_name, created_at, created_by, email, id, is_primary, notes, phone, psychologist_patient_id, relationship, updated_at, updated_by"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError(
        "Failed to update psychologist_patient_emergency_contacts.",
        { cause: error }
      )
    }
    return fromPsychologistPatientEmergencyContactsRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("psychologist_patient_emergency_contacts")
      .delete()
      .eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError(
        "Failed to delete psychologist_patient_emergency_contacts.",
        { cause: error }
      )
    }
  }
}

export { PsychologistPatientEmergencyContactsSupabaseRepository }
