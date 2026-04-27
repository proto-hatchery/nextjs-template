// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { BusySlotsDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/busy-slots.dto.codegen"

export interface BusySlotsListParams {
  limit?: number
  offset?: number
}

export interface BusySlotsListResult {
  rows: BusySlotsDTO[]
}

interface BusySlotsRepository {
  findById(id: string): Promise<BusySlotsDTO | null>
  list(params: BusySlotsListParams): Promise<BusySlotsListResult>
}

export { type BusySlotsRepository }
