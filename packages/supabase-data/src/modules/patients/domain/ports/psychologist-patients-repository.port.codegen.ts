// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { PsychologistPatientsDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patients.dto.codegen"

export interface PsychologistPatientsListParams {
  limit?: number
  offset?: number
}

export interface PsychologistPatientsListResult {
  rows: PsychologistPatientsDTO[]
}

interface PsychologistPatientsRepository {
  findById(id: string): Promise<PsychologistPatientsDTO | null>
  list(params: PsychologistPatientsListParams): Promise<PsychologistPatientsListResult>
  insert(data: Partial<PsychologistPatientsDTO>): Promise<PsychologistPatientsDTO>
  update(id: string, patch: Partial<PsychologistPatientsDTO>): Promise<PsychologistPatientsDTO>
  delete(id: string): Promise<void>
}

export { type PsychologistPatientsRepository }
