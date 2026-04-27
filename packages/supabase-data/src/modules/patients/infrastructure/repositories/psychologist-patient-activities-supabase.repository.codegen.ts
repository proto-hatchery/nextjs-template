// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { PsychologistPatientActivitiesDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-activities.dto.codegen"
import type {
  PsychologistPatientActivitiesRepository,
  PsychologistPatientActivitiesListParams,
  PsychologistPatientActivitiesListResult,
} from "@workspace/supabase-data/modules/patients/domain/ports/psychologist-patient-activities-repository.port.codegen"
import {
  fromPsychologistPatientActivitiesRow,
  toPsychologistPatientActivitiesInsert,
  toPsychologistPatientActivitiesUpdate,
} from "@workspace/supabase-data/modules/patients/infrastructure/mappers/psychologist-patient-activities.mapper.codegen"

class PsychologistPatientActivitiesSupabaseRepository implements PsychologistPatientActivitiesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<PsychologistPatientActivitiesDTO | null> {
    const { data, error } = await this.supabase
      .from("psychologist_patient_activities")
      .select(
        "activity_id, assigned_at, completed_at, created_at, created_by, due_date, id, instructions, is_archived, patient_feedback, patient_id, psychologist_client_id, psychologist_id, response_data, status, submitted_at, therapist_comment, title, updated_at, updated_by"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load psychologist_patient_activities.", {
        cause: error,
      })
    }
    if (!data) return null
    return fromPsychologistPatientActivitiesRow(data)
  }

  async list(
    params: PsychologistPatientActivitiesListParams
  ): Promise<PsychologistPatientActivitiesListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("psychologist_patient_activities")
      .select(
        "activity_id, assigned_at, completed_at, created_at, created_by, due_date, id, instructions, is_archived, patient_feedback, patient_id, psychologist_client_id, psychologist_id, response_data, status, submitted_at, therapist_comment, title, updated_at, updated_by"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list psychologist_patient_activities.", {
        cause: error,
      })
    }
    const rows = (data ?? []).map((row) => fromPsychologistPatientActivitiesRow(row))
    return { rows }
  }

  async insert(
    data: Partial<PsychologistPatientActivitiesDTO>
  ): Promise<PsychologistPatientActivitiesDTO> {
    const payload = toPsychologistPatientActivitiesInsert(data)
    const { data: row, error } = await this.supabase
      .from("psychologist_patient_activities")
      .insert(payload)
      .select(
        "activity_id, assigned_at, completed_at, created_at, created_by, due_date, id, instructions, is_archived, patient_feedback, patient_id, psychologist_client_id, psychologist_id, response_data, status, submitted_at, therapist_comment, title, updated_at, updated_by"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert psychologist_patient_activities.", {
        cause: error,
      })
    }
    return fromPsychologistPatientActivitiesRow(row)
  }

  async update(
    id: string,
    patch: Partial<PsychologistPatientActivitiesDTO>
  ): Promise<PsychologistPatientActivitiesDTO> {
    const payload = toPsychologistPatientActivitiesUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("psychologist_patient_activities")
      .update(payload)
      .eq("id", id)
      .select(
        "activity_id, assigned_at, completed_at, created_at, created_by, due_date, id, instructions, is_archived, patient_feedback, patient_id, psychologist_client_id, psychologist_id, response_data, status, submitted_at, therapist_comment, title, updated_at, updated_by"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update psychologist_patient_activities.", {
        cause: error,
      })
    }
    return fromPsychologistPatientActivitiesRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("psychologist_patient_activities")
      .delete()
      .eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete psychologist_patient_activities.", {
        cause: error,
      })
    }
  }
}

export { PsychologistPatientActivitiesSupabaseRepository }
