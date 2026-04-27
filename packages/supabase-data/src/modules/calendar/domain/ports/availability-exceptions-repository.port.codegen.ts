// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { AvailabilityExceptionsDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/availability-exceptions.dto.codegen"

export interface AvailabilityExceptionsListParams {
  limit?: number
  offset?: number
}

export interface AvailabilityExceptionsListResult {
  rows: AvailabilityExceptionsDTO[]
}

interface AvailabilityExceptionsRepository {
  findById(id: string): Promise<AvailabilityExceptionsDTO | null>
  list(params: AvailabilityExceptionsListParams): Promise<AvailabilityExceptionsListResult>
  insert(data: Partial<AvailabilityExceptionsDTO>): Promise<AvailabilityExceptionsDTO>
  update(id: string, patch: Partial<AvailabilityExceptionsDTO>): Promise<AvailabilityExceptionsDTO>
  delete(id: string): Promise<void>
}

export { type AvailabilityExceptionsRepository }
