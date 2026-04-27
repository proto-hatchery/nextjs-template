// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { PsychologistPreferencesDTO } from "@workspace/supabase-data/modules/preferences/domain/dto/psychologist-preferences.dto.codegen"

export interface PsychologistPreferencesListParams {
  limit?: number
  offset?: number
}

export interface PsychologistPreferencesListResult {
  rows: PsychologistPreferencesDTO[]
}

interface PsychologistPreferencesRepository {
  findById(id: string): Promise<PsychologistPreferencesDTO | null>
  list(params: PsychologistPreferencesListParams): Promise<PsychologistPreferencesListResult>
  insert(data: Partial<PsychologistPreferencesDTO>): Promise<PsychologistPreferencesDTO>
  update(
    id: string,
    patch: Partial<PsychologistPreferencesDTO>
  ): Promise<PsychologistPreferencesDTO>
  delete(id: string): Promise<void>
}

export { type PsychologistPreferencesRepository }
