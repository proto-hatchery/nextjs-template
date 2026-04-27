// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { PsychologistInvoicesDTO } from "@workspace/supabase-data/modules/financial/domain/dto/psychologist-invoices.dto.codegen"

export interface PsychologistInvoicesListParams {
  limit?: number
  offset?: number
}

export interface PsychologistInvoicesListResult {
  rows: PsychologistInvoicesDTO[]
}

interface PsychologistInvoicesRepository {
  findById(id: string): Promise<PsychologistInvoicesDTO | null>
  list(params: PsychologistInvoicesListParams): Promise<PsychologistInvoicesListResult>
  insert(data: Partial<PsychologistInvoicesDTO>): Promise<PsychologistInvoicesDTO>
  update(id: string, patch: Partial<PsychologistInvoicesDTO>): Promise<PsychologistInvoicesDTO>
  delete(id: string): Promise<void>
}

export { type PsychologistInvoicesRepository }
