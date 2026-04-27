// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { ClinicalSessionDetailsDTO } from "@workspace/supabase-data/modules/clinical-sessions/domain/dto/clinical-session-details.dto.codegen"

export interface ClinicalSessionDetailsListParams {
  limit?: number
  offset?: number
}

export interface ClinicalSessionDetailsListResult {
  rows: ClinicalSessionDetailsDTO[]
}

interface ClinicalSessionDetailsRepository {
  findById(id: string): Promise<ClinicalSessionDetailsDTO | null>
  list(params: ClinicalSessionDetailsListParams): Promise<ClinicalSessionDetailsListResult>
  insert(data: Partial<ClinicalSessionDetailsDTO>): Promise<ClinicalSessionDetailsDTO>
  update(id: string, patch: Partial<ClinicalSessionDetailsDTO>): Promise<ClinicalSessionDetailsDTO>
  delete(id: string): Promise<void>
}

export { type ClinicalSessionDetailsRepository }
