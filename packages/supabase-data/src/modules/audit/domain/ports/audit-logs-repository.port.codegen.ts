// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { AuditLogsDTO } from "@workspace/supabase-data/modules/audit/domain/dto/audit-logs.dto.codegen"

export interface AuditLogsListParams {
  limit?: number
  offset?: number
}

export interface AuditLogsListResult {
  rows: AuditLogsDTO[]
}

interface AuditLogsRepository {
  findById(id: string): Promise<AuditLogsDTO | null>
  list(params: AuditLogsListParams): Promise<AuditLogsListResult>
}

export { type AuditLogsRepository }
