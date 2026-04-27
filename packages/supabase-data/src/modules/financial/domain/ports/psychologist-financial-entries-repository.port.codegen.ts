// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { PsychologistFinancialEntriesDTO } from "@workspace/supabase-data/modules/financial/domain/dto/psychologist-financial-entries.dto.codegen"

export interface PsychologistFinancialEntriesListParams {
  limit?: number
  offset?: number
}

export interface PsychologistFinancialEntriesListResult {
  rows: PsychologistFinancialEntriesDTO[]
}

interface PsychologistFinancialEntriesRepository {
  findById(id: string): Promise<PsychologistFinancialEntriesDTO | null>
  list(
    params: PsychologistFinancialEntriesListParams
  ): Promise<PsychologistFinancialEntriesListResult>
  insert(data: Partial<PsychologistFinancialEntriesDTO>): Promise<PsychologistFinancialEntriesDTO>
  update(
    id: string,
    patch: Partial<PsychologistFinancialEntriesDTO>
  ): Promise<PsychologistFinancialEntriesDTO>
  delete(id: string): Promise<void>
}

export { type PsychologistFinancialEntriesRepository }
