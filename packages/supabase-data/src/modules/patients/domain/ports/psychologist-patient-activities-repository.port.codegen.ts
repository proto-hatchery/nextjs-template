// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { PsychologistPatientActivitiesDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-activities.dto.codegen"

export interface PsychologistPatientActivitiesListParams {
  limit?: number
  offset?: number
}

export interface PsychologistPatientActivitiesListResult {
  rows: PsychologistPatientActivitiesDTO[]
}

interface PsychologistPatientActivitiesRepository {
  findById(id: string): Promise<PsychologistPatientActivitiesDTO | null>
  list(
    params: PsychologistPatientActivitiesListParams
  ): Promise<PsychologistPatientActivitiesListResult>
  insert(data: Partial<PsychologistPatientActivitiesDTO>): Promise<PsychologistPatientActivitiesDTO>
  update(
    id: string,
    patch: Partial<PsychologistPatientActivitiesDTO>
  ): Promise<PsychologistPatientActivitiesDTO>
  delete(id: string): Promise<void>
}

export { type PsychologistPatientActivitiesRepository }
