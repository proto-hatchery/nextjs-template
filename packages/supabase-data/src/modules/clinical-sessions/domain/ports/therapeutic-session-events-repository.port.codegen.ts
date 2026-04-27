// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { TherapeuticSessionEventsDTO } from "@workspace/supabase-data/modules/clinical-sessions/domain/dto/therapeutic-session-events.dto.codegen"

export interface TherapeuticSessionEventsListParams {
  limit?: number
  offset?: number
}

export interface TherapeuticSessionEventsListResult {
  rows: TherapeuticSessionEventsDTO[]
}

interface TherapeuticSessionEventsRepository {
  findById(id: string): Promise<TherapeuticSessionEventsDTO | null>
  list(params: TherapeuticSessionEventsListParams): Promise<TherapeuticSessionEventsListResult>
}

export { type TherapeuticSessionEventsRepository }
