// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { PsychologistServicesDTO } from "@workspace/supabase-data/modules/preferences/domain/dto/psychologist-services.dto.codegen"

export interface PsychologistServicesListParams {
  limit?: number
  offset?: number
}

export interface PsychologistServicesListResult {
  rows: PsychologistServicesDTO[]
}

interface PsychologistServicesRepository {
  findById(id: string): Promise<PsychologistServicesDTO | null>
  list(params: PsychologistServicesListParams): Promise<PsychologistServicesListResult>
  insert(data: Partial<PsychologistServicesDTO>): Promise<PsychologistServicesDTO>
  update(id: string, patch: Partial<PsychologistServicesDTO>): Promise<PsychologistServicesDTO>
  delete(id: string): Promise<void>
}

export { type PsychologistServicesRepository }
