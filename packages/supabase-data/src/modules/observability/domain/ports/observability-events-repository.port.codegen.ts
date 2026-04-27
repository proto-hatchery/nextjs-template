// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { ObservabilityEventsDTO } from "@workspace/supabase-data/modules/observability/domain/dto/observability-events.dto.codegen"

export interface ObservabilityEventsListParams {
  limit?: number
  offset?: number
}

export interface ObservabilityEventsListResult {
  rows: ObservabilityEventsDTO[]
}

interface ObservabilityEventsRepository {
  findById(id: string): Promise<ObservabilityEventsDTO | null>
  list(params: ObservabilityEventsListParams): Promise<ObservabilityEventsListResult>
}

export { type ObservabilityEventsRepository }
