// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  EncryptionAuditLogDTOSchema,
  type EncryptionAuditLogDTO,
} from "@workspace/supabase-data/modules/audit/domain/dto/encryption-audit-log.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type EncryptionAuditLogRow = Database["public"]["Tables"]["encryption_audit_log"]["Row"]

const EncryptionAuditLogFieldMappings = {
  attemptedAt: "attempted_at",
  callerRole: "caller_role",
  callerUserId: "caller_user_id",
  context: "context",
  errorMessage: "error_message",
  id: "id",
  operation: "operation",
  success: "success",
} as const

type _EncryptionAuditLogField = keyof typeof EncryptionAuditLogFieldMappings

function fromEncryptionAuditLogRow(row: EncryptionAuditLogRow): EncryptionAuditLogDTO {
  const mapped = {
    attemptedAt: row.attempted_at,
    callerRole: row.caller_role,
    callerUserId: row.caller_user_id,
    context: row.context,
    errorMessage: row.error_message,
    id: row.id,
    operation: row.operation,
    success: row.success,
  }
  return EncryptionAuditLogDTOSchema.parse(mapped)
}

export { fromEncryptionAuditLogRow }
