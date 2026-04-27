// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { PsychologistPatientMedicalItemsDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-medical-items.dto.codegen"

export interface PsychologistPatientMedicalItemsListParams {
  limit?: number
  offset?: number
}

export interface PsychologistPatientMedicalItemsListResult {
  rows: PsychologistPatientMedicalItemsDTO[]
}

interface PsychologistPatientMedicalItemsRepository {
  findById(id: string): Promise<PsychologistPatientMedicalItemsDTO | null>
  list(
    params: PsychologistPatientMedicalItemsListParams
  ): Promise<PsychologistPatientMedicalItemsListResult>
  insert(
    data: Partial<PsychologistPatientMedicalItemsDTO>
  ): Promise<PsychologistPatientMedicalItemsDTO>
  update(
    id: string,
    patch: Partial<PsychologistPatientMedicalItemsDTO>
  ): Promise<PsychologistPatientMedicalItemsDTO>
  delete(id: string): Promise<void>
}

export { type PsychologistPatientMedicalItemsRepository }
