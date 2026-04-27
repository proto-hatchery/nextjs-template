// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { PsychologistPatientGuardianDocumentsDTO } from "@workspace/supabase-data/modules/documents/domain/dto/psychologist-patient-guardian-documents.dto.codegen"
import type {
  PsychologistPatientGuardianDocumentsRepository,
  PsychologistPatientGuardianDocumentsListParams,
  PsychologistPatientGuardianDocumentsListResult,
} from "@workspace/supabase-data/modules/documents/domain/ports/psychologist-patient-guardian-documents-repository.port.codegen"
import {
  fromPsychologistPatientGuardianDocumentsRow,
  toPsychologistPatientGuardianDocumentsInsert,
  toPsychologistPatientGuardianDocumentsUpdate,
} from "@workspace/supabase-data/modules/documents/infrastructure/mappers/psychologist-patient-guardian-documents.mapper.codegen"

class PsychologistPatientGuardianDocumentsSupabaseRepository implements PsychologistPatientGuardianDocumentsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<PsychologistPatientGuardianDocumentsDTO | null> {
    const { data, error } = await this.supabase
      .from("psychologist_patient_guardian_documents")
      .select(
        "created_at, description, document_type, expires_at, file_name, file_size, file_url, guardian_id, id, mime_type, patient_id, psychologist_id, status, title, updated_at, uploaded_at"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load psychologist_patient_guardian_documents.", {
        cause: error,
      })
    }
    if (!data) return null
    return fromPsychologistPatientGuardianDocumentsRow(data)
  }

  async list(
    params: PsychologistPatientGuardianDocumentsListParams
  ): Promise<PsychologistPatientGuardianDocumentsListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("psychologist_patient_guardian_documents")
      .select(
        "created_at, description, document_type, expires_at, file_name, file_size, file_url, guardian_id, id, mime_type, patient_id, psychologist_id, status, title, updated_at, uploaded_at"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list psychologist_patient_guardian_documents.", {
        cause: error,
      })
    }
    const rows = (data ?? []).map((row) => fromPsychologistPatientGuardianDocumentsRow(row))
    return { rows }
  }

  async insert(
    data: Partial<PsychologistPatientGuardianDocumentsDTO>
  ): Promise<PsychologistPatientGuardianDocumentsDTO> {
    const payload = toPsychologistPatientGuardianDocumentsInsert(data)
    const { data: row, error } = await this.supabase
      .from("psychologist_patient_guardian_documents")
      .insert(payload)
      .select(
        "created_at, description, document_type, expires_at, file_name, file_size, file_url, guardian_id, id, mime_type, patient_id, psychologist_id, status, title, updated_at, uploaded_at"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError(
        "Failed to insert psychologist_patient_guardian_documents.",
        { cause: error }
      )
    }
    return fromPsychologistPatientGuardianDocumentsRow(row)
  }

  async update(
    id: string,
    patch: Partial<PsychologistPatientGuardianDocumentsDTO>
  ): Promise<PsychologistPatientGuardianDocumentsDTO> {
    const payload = toPsychologistPatientGuardianDocumentsUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("psychologist_patient_guardian_documents")
      .update(payload)
      .eq("id", id)
      .select(
        "created_at, description, document_type, expires_at, file_name, file_size, file_url, guardian_id, id, mime_type, patient_id, psychologist_id, status, title, updated_at, uploaded_at"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError(
        "Failed to update psychologist_patient_guardian_documents.",
        { cause: error }
      )
    }
    return fromPsychologistPatientGuardianDocumentsRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("psychologist_patient_guardian_documents")
      .delete()
      .eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError(
        "Failed to delete psychologist_patient_guardian_documents.",
        { cause: error }
      )
    }
  }
}

export { PsychologistPatientGuardianDocumentsSupabaseRepository }
