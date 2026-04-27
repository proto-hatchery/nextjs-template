// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { PsychologistAssistantsDTO } from "@workspace/supabase-data/modules/assistants/domain/dto/psychologist-assistants.dto.codegen"

export interface PsychologistAssistantsListParams {
  limit?: number
  offset?: number
}

export interface PsychologistAssistantsListResult {
  rows: PsychologistAssistantsDTO[]
}

interface PsychologistAssistantsRepository {
  list(params: PsychologistAssistantsListParams): Promise<PsychologistAssistantsListResult>
  insert(data: Partial<PsychologistAssistantsDTO>): Promise<PsychologistAssistantsDTO>
  update(id: string, patch: Partial<PsychologistAssistantsDTO>): Promise<PsychologistAssistantsDTO>
  delete(id: string): Promise<void>
}

export { type PsychologistAssistantsRepository }
