// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { PsychologistClinicalSessionsDTO } from "@workspace/supabase-data/modules/clinical-sessions/domain/dto/psychologist-clinical-sessions.dto.codegen"

export interface PsychologistClinicalSessionsListParams {
  limit?: number
  offset?: number
}

export interface PsychologistClinicalSessionsListResult {
  rows: PsychologistClinicalSessionsDTO[]
}

interface PsychologistClinicalSessionsRepository {
  findById(id: string): Promise<PsychologistClinicalSessionsDTO | null>
  list(
    params: PsychologistClinicalSessionsListParams
  ): Promise<PsychologistClinicalSessionsListResult>
  insert(data: Partial<PsychologistClinicalSessionsDTO>): Promise<PsychologistClinicalSessionsDTO>
  update(
    id: string,
    patch: Partial<PsychologistClinicalSessionsDTO>
  ): Promise<PsychologistClinicalSessionsDTO>
  delete(id: string): Promise<void>
}

export { type PsychologistClinicalSessionsRepository }
