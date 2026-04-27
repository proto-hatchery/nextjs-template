// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { PsychologistPatientServicesDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-services.dto.codegen"

export interface PsychologistPatientServicesListParams {
  limit?: number
  offset?: number
}

export interface PsychologistPatientServicesListResult {
  rows: PsychologistPatientServicesDTO[]
}

interface PsychologistPatientServicesRepository {
  findById(id: string): Promise<PsychologistPatientServicesDTO | null>
  list(
    params: PsychologistPatientServicesListParams
  ): Promise<PsychologistPatientServicesListResult>
  insert(data: Partial<PsychologistPatientServicesDTO>): Promise<PsychologistPatientServicesDTO>
  update(
    id: string,
    patch: Partial<PsychologistPatientServicesDTO>
  ): Promise<PsychologistPatientServicesDTO>
  delete(id: string): Promise<void>
}

export { type PsychologistPatientServicesRepository }
