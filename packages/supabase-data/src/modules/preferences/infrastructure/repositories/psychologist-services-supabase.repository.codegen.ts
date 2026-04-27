// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { PsychologistServicesDTO } from "@workspace/supabase-data/modules/preferences/domain/dto/psychologist-services.dto.codegen"
import type {
  PsychologistServicesRepository,
  PsychologistServicesListParams,
  PsychologistServicesListResult,
} from "@workspace/supabase-data/modules/preferences/domain/ports/psychologist-services-repository.port.codegen"
import {
  fromPsychologistServicesRow,
  toPsychologistServicesInsert,
  toPsychologistServicesUpdate,
} from "@workspace/supabase-data/modules/preferences/infrastructure/mappers/psychologist-services.mapper.codegen"

class PsychologistServicesSupabaseRepository implements PsychologistServicesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<PsychologistServicesDTO | null> {
    const { data, error } = await this.supabase
      .from("psychologist_services")
      .select(
        "catalog_id, created_at, description, duration_minutes, id, is_active, is_public, name, price, psychologist_id, service_id, sort_order, updated_at"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load psychologist_services.", { cause: error })
    }
    if (!data) return null
    return fromPsychologistServicesRow(data)
  }

  async list(params: PsychologistServicesListParams): Promise<PsychologistServicesListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("psychologist_services")
      .select(
        "catalog_id, created_at, description, duration_minutes, id, is_active, is_public, name, price, psychologist_id, service_id, sort_order, updated_at"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list psychologist_services.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromPsychologistServicesRow(row))
    return { rows }
  }

  async insert(data: Partial<PsychologistServicesDTO>): Promise<PsychologistServicesDTO> {
    const payload = toPsychologistServicesInsert(data)
    const { data: row, error } = await this.supabase
      .from("psychologist_services")
      .insert(payload)
      .select(
        "catalog_id, created_at, description, duration_minutes, id, is_active, is_public, name, price, psychologist_id, service_id, sort_order, updated_at"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert psychologist_services.", { cause: error })
    }
    return fromPsychologistServicesRow(row)
  }

  async update(
    id: string,
    patch: Partial<PsychologistServicesDTO>
  ): Promise<PsychologistServicesDTO> {
    const payload = toPsychologistServicesUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("psychologist_services")
      .update(payload)
      .eq("id", id)
      .select(
        "catalog_id, created_at, description, duration_minutes, id, is_active, is_public, name, price, psychologist_id, service_id, sort_order, updated_at"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update psychologist_services.", { cause: error })
    }
    return fromPsychologistServicesRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("psychologist_services").delete().eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete psychologist_services.", { cause: error })
    }
  }
}

export { PsychologistServicesSupabaseRepository }
