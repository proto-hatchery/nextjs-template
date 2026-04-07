// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"

import type { BusySlotsRepository, BusySlotsListParams, BusySlotsListResult } from "@workspace/supabase-data/modules/calendar/domain/ports/busy-slots-repository.port.codegen"
import { fromBusySlotsRow, toBusySlotsInsert, toBusySlotsUpdate } from "@workspace/supabase-data/modules/calendar/infrastructure/mappers/busy-slots.mapper.codegen"
import type { BusySlotsDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/busy-slots.dto.codegen"

class BusySlotsSupabaseRepository implements BusySlotsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<BusySlotsDTO | null> {
    const { data, error } = await this.supabase
      .from("busy_slots")
      .select("created_at, event_type, id, is_hard_block, psychologist_id, slot_range, source_id, source_type, title")
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load busy_slots.", { cause: error })
    }
    if (!data) return null
    return fromBusySlotsRow(data)
  }

  async list(params: BusySlotsListParams): Promise<BusySlotsListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase.from("busy_slots").select("created_at, event_type, id, is_hard_block, psychologist_id, slot_range, source_id, source_type, title").range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list busy_slots.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromBusySlotsRow(row))
    return { rows }
  }

  async insert(data: Partial<BusySlotsDTO>): Promise<BusySlotsDTO> {
    const payload = toBusySlotsInsert(data)
    const { data: row, error } = await this.supabase
      .from("busy_slots")
      .insert(payload)
      .select("created_at, event_type, id, is_hard_block, psychologist_id, slot_range, source_id, source_type, title")
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert busy_slots.", { cause: error })
    }
    return fromBusySlotsRow(row)
  }

  async update(id: string, patch: Partial<BusySlotsDTO>): Promise<BusySlotsDTO> {
    const payload = toBusySlotsUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("busy_slots")
      .update(payload)
      .eq("id", id)
      .select("created_at, event_type, id, is_hard_block, psychologist_id, slot_range, source_id, source_type, title")
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update busy_slots.", { cause: error })
    }
    return fromBusySlotsRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("busy_slots").delete().eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete busy_slots.", { cause: error })
    }
  }

}

export { BusySlotsSupabaseRepository }
