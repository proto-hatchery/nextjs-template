// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { PsychologistPatientGuardiansDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-guardians.dto.codegen"
import type {
  PsychologistPatientGuardiansRepository,
  PsychologistPatientGuardiansListParams,
  PsychologistPatientGuardiansListResult,
} from "@workspace/supabase-data/modules/patients/domain/ports/psychologist-patient-guardians-repository.port.codegen"
import {
  fromPsychologistPatientGuardiansRow,
  toPsychologistPatientGuardiansInsert,
  toPsychologistPatientGuardiansUpdate,
} from "@workspace/supabase-data/modules/patients/infrastructure/mappers/psychologist-patient-guardians.mapper.codegen"

class PsychologistPatientGuardiansSupabaseRepository implements PsychologistPatientGuardiansRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<PsychologistPatientGuardiansDTO | null> {
    const { data, error } = await this.supabase
      .from("psychologist_patient_guardians")
      .select(
        "city, complement, country, cpf, created_at, date_of_birth, email, full_name, guardian_type, id, name, neighborhood, number, patient_id, phone, postal_code, psychologist_id, relationship, rg, state, status, street, updated_at"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load psychologist_patient_guardians.", {
        cause: error,
      })
    }
    if (!data) return null
    return fromPsychologistPatientGuardiansRow(data)
  }

  async list(
    params: PsychologistPatientGuardiansListParams
  ): Promise<PsychologistPatientGuardiansListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("psychologist_patient_guardians")
      .select(
        "city, complement, country, cpf, created_at, date_of_birth, email, full_name, guardian_type, id, name, neighborhood, number, patient_id, phone, postal_code, psychologist_id, relationship, rg, state, status, street, updated_at"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list psychologist_patient_guardians.", {
        cause: error,
      })
    }
    const rows = (data ?? []).map((row) => fromPsychologistPatientGuardiansRow(row))
    return { rows }
  }

  async insert(
    data: Partial<PsychologistPatientGuardiansDTO>
  ): Promise<PsychologistPatientGuardiansDTO> {
    const payload = toPsychologistPatientGuardiansInsert(data)
    const { data: row, error } = await this.supabase
      .from("psychologist_patient_guardians")
      .insert(payload)
      .select(
        "city, complement, country, cpf, created_at, date_of_birth, email, full_name, guardian_type, id, name, neighborhood, number, patient_id, phone, postal_code, psychologist_id, relationship, rg, state, status, street, updated_at"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert psychologist_patient_guardians.", {
        cause: error,
      })
    }
    return fromPsychologistPatientGuardiansRow(row)
  }

  async update(
    id: string,
    patch: Partial<PsychologistPatientGuardiansDTO>
  ): Promise<PsychologistPatientGuardiansDTO> {
    const payload = toPsychologistPatientGuardiansUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("psychologist_patient_guardians")
      .update(payload)
      .eq("id", id)
      .select(
        "city, complement, country, cpf, created_at, date_of_birth, email, full_name, guardian_type, id, name, neighborhood, number, patient_id, phone, postal_code, psychologist_id, relationship, rg, state, status, street, updated_at"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update psychologist_patient_guardians.", {
        cause: error,
      })
    }
    return fromPsychologistPatientGuardiansRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("psychologist_patient_guardians")
      .delete()
      .eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete psychologist_patient_guardians.", {
        cause: error,
      })
    }
  }
}

export { PsychologistPatientGuardiansSupabaseRepository }
