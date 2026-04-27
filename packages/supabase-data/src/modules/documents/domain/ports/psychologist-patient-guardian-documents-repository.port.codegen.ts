// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { PsychologistPatientGuardianDocumentsDTO } from "@workspace/supabase-data/modules/documents/domain/dto/psychologist-patient-guardian-documents.dto.codegen"

export interface PsychologistPatientGuardianDocumentsListParams {
  limit?: number
  offset?: number
}

export interface PsychologistPatientGuardianDocumentsListResult {
  rows: PsychologistPatientGuardianDocumentsDTO[]
}

interface PsychologistPatientGuardianDocumentsRepository {
  findById(id: string): Promise<PsychologistPatientGuardianDocumentsDTO | null>
  list(
    params: PsychologistPatientGuardianDocumentsListParams
  ): Promise<PsychologistPatientGuardianDocumentsListResult>
  insert(
    data: Partial<PsychologistPatientGuardianDocumentsDTO>
  ): Promise<PsychologistPatientGuardianDocumentsDTO>
  update(
    id: string,
    patch: Partial<PsychologistPatientGuardianDocumentsDTO>
  ): Promise<PsychologistPatientGuardianDocumentsDTO>
  delete(id: string): Promise<void>
}

export { type PsychologistPatientGuardianDocumentsRepository }
