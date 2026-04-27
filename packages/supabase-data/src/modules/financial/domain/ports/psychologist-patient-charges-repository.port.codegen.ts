// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { PsychologistPatientChargesDTO } from "@workspace/supabase-data/modules/financial/domain/dto/psychologist-patient-charges.dto.codegen"

export interface PsychologistPatientChargesListParams {
  limit?: number
  offset?: number
}

export interface PsychologistPatientChargesListResult {
  rows: PsychologistPatientChargesDTO[]
}

interface PsychologistPatientChargesRepository {
  findById(id: string): Promise<PsychologistPatientChargesDTO | null>
  list(params: PsychologistPatientChargesListParams): Promise<PsychologistPatientChargesListResult>
  insert(data: Partial<PsychologistPatientChargesDTO>): Promise<PsychologistPatientChargesDTO>
  update(
    id: string,
    patch: Partial<PsychologistPatientChargesDTO>
  ): Promise<PsychologistPatientChargesDTO>
  delete(id: string): Promise<void>
}

export { type PsychologistPatientChargesRepository }
