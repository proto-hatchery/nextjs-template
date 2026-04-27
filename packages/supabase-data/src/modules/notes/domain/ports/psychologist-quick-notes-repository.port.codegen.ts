// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { PsychologistQuickNotesDTO } from "@workspace/supabase-data/modules/notes/domain/dto/psychologist-quick-notes.dto.codegen"

export interface PsychologistQuickNotesListParams {
  limit?: number
  offset?: number
}

export interface PsychologistQuickNotesListResult {
  rows: PsychologistQuickNotesDTO[]
}

interface PsychologistQuickNotesRepository {
  findById(id: string): Promise<PsychologistQuickNotesDTO | null>
  list(params: PsychologistQuickNotesListParams): Promise<PsychologistQuickNotesListResult>
  insert(data: Partial<PsychologistQuickNotesDTO>): Promise<PsychologistQuickNotesDTO>
  update(id: string, patch: Partial<PsychologistQuickNotesDTO>): Promise<PsychologistQuickNotesDTO>
  delete(id: string): Promise<void>
}

export { type PsychologistQuickNotesRepository }
