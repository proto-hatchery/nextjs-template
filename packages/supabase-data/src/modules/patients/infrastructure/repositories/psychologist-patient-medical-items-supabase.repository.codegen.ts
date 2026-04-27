// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { PsychologistPatientMedicalItemsDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-medical-items.dto.codegen"
import type {
  PsychologistPatientMedicalItemsRepository,
  PsychologistPatientMedicalItemsListParams,
  PsychologistPatientMedicalItemsListResult,
} from "@workspace/supabase-data/modules/patients/domain/ports/psychologist-patient-medical-items-repository.port.codegen"
import {
  fromPsychologistPatientMedicalItemsRow,
  toPsychologistPatientMedicalItemsInsert,
  toPsychologistPatientMedicalItemsUpdate,
} from "@workspace/supabase-data/modules/patients/infrastructure/mappers/psychologist-patient-medical-items.mapper.codegen"

class PsychologistPatientMedicalItemsSupabaseRepository implements PsychologistPatientMedicalItemsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<PsychologistPatientMedicalItemsDTO | null> {
    const { data, error } = await this.supabase
      .from("psychologist_patient_medical_items")
      .select(
        "created_at, description, diagnosed_date, dosage, end_date, frequency, icd10_code, id, is_active, item_kind, kind, name, notes, psychologist_id, psychologist_patient_id, start_date, updated_at"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load psychologist_patient_medical_items.", {
        cause: error,
      })
    }
    if (!data) return null
    return fromPsychologistPatientMedicalItemsRow(data)
  }

  async list(
    params: PsychologistPatientMedicalItemsListParams
  ): Promise<PsychologistPatientMedicalItemsListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("psychologist_patient_medical_items")
      .select(
        "created_at, description, diagnosed_date, dosage, end_date, frequency, icd10_code, id, is_active, item_kind, kind, name, notes, psychologist_id, psychologist_patient_id, start_date, updated_at"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list psychologist_patient_medical_items.", {
        cause: error,
      })
    }
    const rows = (data ?? []).map((row) => fromPsychologistPatientMedicalItemsRow(row))
    return { rows }
  }

  async insert(
    data: Partial<PsychologistPatientMedicalItemsDTO>
  ): Promise<PsychologistPatientMedicalItemsDTO> {
    const payload = toPsychologistPatientMedicalItemsInsert(data)
    const { data: row, error } = await this.supabase
      .from("psychologist_patient_medical_items")
      .insert(payload)
      .select(
        "created_at, description, diagnosed_date, dosage, end_date, frequency, icd10_code, id, is_active, item_kind, kind, name, notes, psychologist_id, psychologist_patient_id, start_date, updated_at"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert psychologist_patient_medical_items.", {
        cause: error,
      })
    }
    return fromPsychologistPatientMedicalItemsRow(row)
  }

  async update(
    id: string,
    patch: Partial<PsychologistPatientMedicalItemsDTO>
  ): Promise<PsychologistPatientMedicalItemsDTO> {
    const payload = toPsychologistPatientMedicalItemsUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("psychologist_patient_medical_items")
      .update(payload)
      .eq("id", id)
      .select(
        "created_at, description, diagnosed_date, dosage, end_date, frequency, icd10_code, id, is_active, item_kind, kind, name, notes, psychologist_id, psychologist_patient_id, start_date, updated_at"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update psychologist_patient_medical_items.", {
        cause: error,
      })
    }
    return fromPsychologistPatientMedicalItemsRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("psychologist_patient_medical_items")
      .delete()
      .eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete psychologist_patient_medical_items.", {
        cause: error,
      })
    }
  }
}

export { PsychologistPatientMedicalItemsSupabaseRepository }
