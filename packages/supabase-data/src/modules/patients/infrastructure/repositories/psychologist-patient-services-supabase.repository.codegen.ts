// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { PsychologistPatientServicesDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-services.dto.codegen"
import type {
  PsychologistPatientServicesRepository,
  PsychologistPatientServicesListParams,
  PsychologistPatientServicesListResult,
} from "@workspace/supabase-data/modules/patients/domain/ports/psychologist-patient-services-repository.port.codegen"
import {
  fromPsychologistPatientServicesRow,
  toPsychologistPatientServicesInsert,
  toPsychologistPatientServicesUpdate,
} from "@workspace/supabase-data/modules/patients/infrastructure/mappers/psychologist-patient-services.mapper.codegen"

class PsychologistPatientServicesSupabaseRepository implements PsychologistPatientServicesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<PsychologistPatientServicesDTO | null> {
    const { data, error } = await this.supabase
      .from("psychologist_patient_services")
      .select(
        "created_at, id, price_cents, psychologist_id, psychologist_patient_id, service_id, updated_at"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load psychologist_patient_services.", {
        cause: error,
      })
    }
    if (!data) return null
    return fromPsychologistPatientServicesRow(data)
  }

  async list(
    params: PsychologistPatientServicesListParams
  ): Promise<PsychologistPatientServicesListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("psychologist_patient_services")
      .select(
        "created_at, id, price_cents, psychologist_id, psychologist_patient_id, service_id, updated_at"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list psychologist_patient_services.", {
        cause: error,
      })
    }
    const rows = (data ?? []).map((row) => fromPsychologistPatientServicesRow(row))
    return { rows }
  }

  async insert(
    data: Partial<PsychologistPatientServicesDTO>
  ): Promise<PsychologistPatientServicesDTO> {
    const payload = toPsychologistPatientServicesInsert(data)
    const { data: row, error } = await this.supabase
      .from("psychologist_patient_services")
      .insert(payload)
      .select(
        "created_at, id, price_cents, psychologist_id, psychologist_patient_id, service_id, updated_at"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert psychologist_patient_services.", {
        cause: error,
      })
    }
    return fromPsychologistPatientServicesRow(row)
  }

  async update(
    id: string,
    patch: Partial<PsychologistPatientServicesDTO>
  ): Promise<PsychologistPatientServicesDTO> {
    const payload = toPsychologistPatientServicesUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("psychologist_patient_services")
      .update(payload)
      .eq("id", id)
      .select(
        "created_at, id, price_cents, psychologist_id, psychologist_patient_id, service_id, updated_at"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update psychologist_patient_services.", {
        cause: error,
      })
    }
    return fromPsychologistPatientServicesRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("psychologist_patient_services")
      .delete()
      .eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete psychologist_patient_services.", {
        cause: error,
      })
    }
  }
}

export { PsychologistPatientServicesSupabaseRepository }
