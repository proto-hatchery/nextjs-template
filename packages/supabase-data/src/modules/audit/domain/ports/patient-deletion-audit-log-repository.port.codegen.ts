// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { PatientDeletionAuditLogDTO } from "@workspace/supabase-data/modules/audit/domain/dto/patient-deletion-audit-log.dto.codegen"

export interface PatientDeletionAuditLogListParams {
  limit?: number
  offset?: number
}

export interface PatientDeletionAuditLogListResult {
  rows: PatientDeletionAuditLogDTO[]
}

interface PatientDeletionAuditLogRepository {
  findById(id: string): Promise<PatientDeletionAuditLogDTO | null>
  list(params: PatientDeletionAuditLogListParams): Promise<PatientDeletionAuditLogListResult>
}

export { type PatientDeletionAuditLogRepository }
