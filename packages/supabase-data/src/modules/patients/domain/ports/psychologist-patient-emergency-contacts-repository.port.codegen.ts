// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { PsychologistPatientEmergencyContactsDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-emergency-contacts.dto.codegen"

export interface PsychologistPatientEmergencyContactsListParams {
  limit?: number
  offset?: number
}

export interface PsychologistPatientEmergencyContactsListResult {
  rows: PsychologistPatientEmergencyContactsDTO[]
}

interface PsychologistPatientEmergencyContactsRepository {
  findById(id: string): Promise<PsychologistPatientEmergencyContactsDTO | null>
  list(
    params: PsychologistPatientEmergencyContactsListParams
  ): Promise<PsychologistPatientEmergencyContactsListResult>
  insert(
    data: Partial<PsychologistPatientEmergencyContactsDTO>
  ): Promise<PsychologistPatientEmergencyContactsDTO>
  update(
    id: string,
    patch: Partial<PsychologistPatientEmergencyContactsDTO>
  ): Promise<PsychologistPatientEmergencyContactsDTO>
  delete(id: string): Promise<void>
}

export { type PsychologistPatientEmergencyContactsRepository }
