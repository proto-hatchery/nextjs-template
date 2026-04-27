// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { PsychologistNotesDTO } from "@workspace/supabase-data/modules/notes/domain/dto/psychologist-notes.dto.codegen"

export interface PsychologistNotesListParams {
  limit?: number
  offset?: number
}

export interface PsychologistNotesListResult {
  rows: PsychologistNotesDTO[]
}

interface PsychologistNotesRepository {
  findById(id: string): Promise<PsychologistNotesDTO | null>
  list(params: PsychologistNotesListParams): Promise<PsychologistNotesListResult>
  insert(data: Partial<PsychologistNotesDTO>): Promise<PsychologistNotesDTO>
  update(id: string, patch: Partial<PsychologistNotesDTO>): Promise<PsychologistNotesDTO>
  delete(id: string): Promise<void>
}

export { type PsychologistNotesRepository }
