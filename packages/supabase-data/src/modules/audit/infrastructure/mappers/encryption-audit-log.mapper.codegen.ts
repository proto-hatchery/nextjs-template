// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { Database } from "@workspace/supabase-infra/types/database"

import { EncryptionAuditLogDTOSchema, type EncryptionAuditLogDTO } from "@workspace/supabase-data/modules/audit/domain/dto/encryption-audit-log.dto.codegen"

type EncryptionAuditLogRow = Database["public"]["Tables"]["encryption_audit_log"]["Row"]
type EncryptionAuditLogInsert = Database["public"]["Tables"]["encryption_audit_log"]["Insert"]
type EncryptionAuditLogUpdate = Database["public"]["Tables"]["encryption_audit_log"]["Update"]

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

type EncryptionAuditLogField = keyof typeof EncryptionAuditLogFieldMappings

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

function toEncryptionAuditLogInsert(dto: Partial<EncryptionAuditLogDTO>): EncryptionAuditLogInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(EncryptionAuditLogFieldMappings) as Array<
    [EncryptionAuditLogField, (typeof EncryptionAuditLogFieldMappings)[EncryptionAuditLogField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as EncryptionAuditLogInsert
}

function toEncryptionAuditLogUpdate(dto: Partial<EncryptionAuditLogDTO>): EncryptionAuditLogUpdate {
  return toEncryptionAuditLogInsert(dto) as EncryptionAuditLogUpdate
}

export { fromEncryptionAuditLogRow, toEncryptionAuditLogInsert, toEncryptionAuditLogUpdate }
