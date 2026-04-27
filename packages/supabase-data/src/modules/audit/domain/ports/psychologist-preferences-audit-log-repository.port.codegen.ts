// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { PsychologistPreferencesAuditLogDTO } from "@workspace/supabase-data/modules/audit/domain/dto/psychologist-preferences-audit-log.dto.codegen"

export interface PsychologistPreferencesAuditLogListParams {
  limit?: number
  offset?: number
}

export interface PsychologistPreferencesAuditLogListResult {
  rows: PsychologistPreferencesAuditLogDTO[]
}

interface PsychologistPreferencesAuditLogRepository {
  findById(id: string): Promise<PsychologistPreferencesAuditLogDTO | null>
  list(
    params: PsychologistPreferencesAuditLogListParams
  ): Promise<PsychologistPreferencesAuditLogListResult>
}

export { type PsychologistPreferencesAuditLogRepository }
