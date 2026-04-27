// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { AvailabilityExceptionsDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/availability-exceptions.dto.codegen"
import type {
  AvailabilityExceptionsRepository,
  AvailabilityExceptionsListParams,
  AvailabilityExceptionsListResult,
} from "@workspace/supabase-data/modules/calendar/domain/ports/availability-exceptions-repository.port.codegen"
import {
  fromAvailabilityExceptionsRow,
  toAvailabilityExceptionsInsert,
  toAvailabilityExceptionsUpdate,
} from "@workspace/supabase-data/modules/calendar/infrastructure/mappers/availability-exceptions.mapper.codegen"

class AvailabilityExceptionsSupabaseRepository implements AvailabilityExceptionsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<AvailabilityExceptionsDTO | null> {
    const { data, error } = await this.supabase
      .from("availability_exceptions")
      .select(
        "created_at, end_time, exception_date, id, is_available, psychologist_id, reason, start_time, updated_at"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load availability_exceptions.", { cause: error })
    }
    if (!data) return null
    return fromAvailabilityExceptionsRow(data)
  }

  async list(params: AvailabilityExceptionsListParams): Promise<AvailabilityExceptionsListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("availability_exceptions")
      .select(
        "created_at, end_time, exception_date, id, is_available, psychologist_id, reason, start_time, updated_at"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list availability_exceptions.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromAvailabilityExceptionsRow(row))
    return { rows }
  }

  async insert(data: Partial<AvailabilityExceptionsDTO>): Promise<AvailabilityExceptionsDTO> {
    const payload = toAvailabilityExceptionsInsert(data)
    const { data: row, error } = await this.supabase
      .from("availability_exceptions")
      .insert(payload)
      .select(
        "created_at, end_time, exception_date, id, is_available, psychologist_id, reason, start_time, updated_at"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert availability_exceptions.", {
        cause: error,
      })
    }
    return fromAvailabilityExceptionsRow(row)
  }

  async update(
    id: string,
    patch: Partial<AvailabilityExceptionsDTO>
  ): Promise<AvailabilityExceptionsDTO> {
    const payload = toAvailabilityExceptionsUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("availability_exceptions")
      .update(payload)
      .eq("id", id)
      .select(
        "created_at, end_time, exception_date, id, is_available, psychologist_id, reason, start_time, updated_at"
      )
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update availability_exceptions.", {
        cause: error,
      })
    }
    return fromAvailabilityExceptionsRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("availability_exceptions").delete().eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete availability_exceptions.", {
        cause: error,
      })
    }
  }
}

export { AvailabilityExceptionsSupabaseRepository }
