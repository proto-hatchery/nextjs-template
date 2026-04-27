// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { PsychologistPatientAssessmentsDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-assessments.dto.codegen"

export interface PsychologistPatientAssessmentsListParams {
  limit?: number
  offset?: number
}

export interface PsychologistPatientAssessmentsListResult {
  rows: PsychologistPatientAssessmentsDTO[]
}

interface PsychologistPatientAssessmentsRepository {
  findById(id: string): Promise<PsychologistPatientAssessmentsDTO | null>
  list(
    params: PsychologistPatientAssessmentsListParams
  ): Promise<PsychologistPatientAssessmentsListResult>
  insert(
    data: Partial<PsychologistPatientAssessmentsDTO>
  ): Promise<PsychologistPatientAssessmentsDTO>
  update(
    id: string,
    patch: Partial<PsychologistPatientAssessmentsDTO>
  ): Promise<PsychologistPatientAssessmentsDTO>
  delete(id: string): Promise<void>
}

export { type PsychologistPatientAssessmentsRepository }
