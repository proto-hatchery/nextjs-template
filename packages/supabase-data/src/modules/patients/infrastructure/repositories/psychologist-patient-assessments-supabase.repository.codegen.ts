// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { PsychologistPatientAssessmentsDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-assessments.dto.codegen"
import type {
  PsychologistPatientAssessmentsRepository,
  PsychologistPatientAssessmentsListParams,
  PsychologistPatientAssessmentsListResult,
} from "@workspace/supabase-data/modules/patients/domain/ports/psychologist-patient-assessments-repository.port.codegen"
import {
  fromPsychologistPatientAssessmentsRow,
  toPsychologistPatientAssessmentsInsert,
  toPsychologistPatientAssessmentsUpdate,
} from "@workspace/supabase-data/modules/patients/infrastructure/mappers/psychologist-patient-assessments.mapper.codegen"

class PsychologistPatientAssessmentsSupabaseRepository implements PsychologistPatientAssessmentsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<PsychologistPatientAssessmentsDTO | null> {
    const { data, error } = await this.supabase
      .from("psychologist_patient_assessments")
      .select(
        "applied_at, clinical_note_id, created_at, created_by, file_url, id, interpretation, is_archived, name, notes, patient_id, psychologist_client_id, psychologist_id, psychologist_notes, results, status, tags, test_date, test_id, test_name, test_type, updated_at, updated_by"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load psychologist_patient_assessments.", {
        cause: error,
      })
    }
    if (!data) return null
    return fromPsychologistPatientAssessmentsRow(data)
  }

  async list(
    params: PsychologistPatientAssessmentsListParams
  ): Promise<PsychologistPatientAssessmentsListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("psychologist_patient_assessments")
      .select(
        "applied_at, clinical_note_id, created_at, created_by, file_url, id, interpretation, is_archived, name, notes, patient_id, psychologist_client_id, psychologist_id, psychologist_notes, results, status, tags, test_date, test_id, test_name, test_type, updated_at, updated_by"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list psychologist_patient_assessments.", {
        cause: error,
      })
    }
    const rows = (data ?? []).map((row) => fromPsychologistPatientAssessmentsRow(row))
    return { rows }
  }

  async insert(
    data: Partial<PsychologistPatientAssessmentsDTO>
  ): Promise<PsychologistPatientAssessmentsDTO> {
    const payload = toPsychologistPatientAssessmentsInsert(data)
    const { data: row, error } = await this.supabase
      .from("psychologist_patient_assessments")
      .insert(payload)
      .select(
        "applied_at, clinical_note_id, created_at, created_by, file_url, id, interpretation, is_archived, name, notes, patient_id, psychologist_client_id, psychologist_id, psychologist_notes, results, status, tags, test_date, test_id, test_name, test_type, updated_at, updated_by"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert psychologist_patient_assessments.", {
        cause: error,
      })
    }
    return fromPsychologistPatientAssessmentsRow(row)
  }

  async update(
    id: string,
    patch: Partial<PsychologistPatientAssessmentsDTO>
  ): Promise<PsychologistPatientAssessmentsDTO> {
    const payload = toPsychologistPatientAssessmentsUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("psychologist_patient_assessments")
      .update(payload)
      .eq("id", id)
      .select(
        "applied_at, clinical_note_id, created_at, created_by, file_url, id, interpretation, is_archived, name, notes, patient_id, psychologist_client_id, psychologist_id, psychologist_notes, results, status, tags, test_date, test_id, test_name, test_type, updated_at, updated_by"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update psychologist_patient_assessments.", {
        cause: error,
      })
    }
    return fromPsychologistPatientAssessmentsRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("psychologist_patient_assessments")
      .delete()
      .eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete psychologist_patient_assessments.", {
        cause: error,
      })
    }
  }
}

export { PsychologistPatientAssessmentsSupabaseRepository }
