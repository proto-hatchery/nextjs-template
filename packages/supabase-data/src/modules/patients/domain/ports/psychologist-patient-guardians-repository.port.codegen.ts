// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { PsychologistPatientGuardiansDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-guardians.dto.codegen"

export interface PsychologistPatientGuardiansListParams {
  limit?: number
  offset?: number
}

export interface PsychologistPatientGuardiansListResult {
  rows: PsychologistPatientGuardiansDTO[]
}

interface PsychologistPatientGuardiansRepository {
  findById(id: string): Promise<PsychologistPatientGuardiansDTO | null>
  list(
    params: PsychologistPatientGuardiansListParams
  ): Promise<PsychologistPatientGuardiansListResult>
  insert(data: Partial<PsychologistPatientGuardiansDTO>): Promise<PsychologistPatientGuardiansDTO>
  update(
    id: string,
    patch: Partial<PsychologistPatientGuardiansDTO>
  ): Promise<PsychologistPatientGuardiansDTO>
  delete(id: string): Promise<void>
}

export { type PsychologistPatientGuardiansRepository }
