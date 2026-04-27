// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { EncryptionAuditLogDTO } from "@workspace/supabase-data/modules/audit/domain/dto/encryption-audit-log.dto.codegen"

export interface EncryptionAuditLogListParams {
  limit?: number
  offset?: number
}

export interface EncryptionAuditLogListResult {
  rows: EncryptionAuditLogDTO[]
}

interface EncryptionAuditLogRepository {
  findById(id: string): Promise<EncryptionAuditLogDTO | null>
  list(params: EncryptionAuditLogListParams): Promise<EncryptionAuditLogListResult>
}

export { type EncryptionAuditLogRepository }
