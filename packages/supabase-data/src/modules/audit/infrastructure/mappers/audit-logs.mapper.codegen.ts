// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { Database } from "@workspace/supabase-infra/types/database"

import { AuditLogsDTOSchema, type AuditLogsDTO } from "@workspace/supabase-data/modules/audit/domain/dto/audit-logs.dto.codegen"

type AuditLogsRow = Database["public"]["Tables"]["audit_logs"]["Row"]
type AuditLogsInsert = Database["public"]["Tables"]["audit_logs"]["Insert"]
type AuditLogsUpdate = Database["public"]["Tables"]["audit_logs"]["Update"]

const AuditLogsFieldMappings = {
  action: "action",
  changedFields: "changed_fields",
  correlationId: "correlation_id",
  createdAt: "created_at",
  id: "id",
  ipAddress: "ip_address",
  recordId: "record_id",
  tableName: "table_name",
  userAgent: "user_agent",
  userId: "user_id",
  userType: "user_type",
} as const

type AuditLogsField = keyof typeof AuditLogsFieldMappings

function fromAuditLogsRow(row: AuditLogsRow): AuditLogsDTO {
  const mapped = {
    action: row.action,
    changedFields: row.changed_fields,
    correlationId: row.correlation_id,
    createdAt: row.created_at,
    id: row.id,
    ipAddress: row.ip_address,
    recordId: row.record_id,
    tableName: row.table_name,
    userAgent: row.user_agent,
    userId: row.user_id,
    userType: row.user_type,
  }
  return AuditLogsDTOSchema.parse(mapped)
}

function toAuditLogsInsert(dto: Partial<AuditLogsDTO>): AuditLogsInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(AuditLogsFieldMappings) as Array<
    [AuditLogsField, (typeof AuditLogsFieldMappings)[AuditLogsField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as AuditLogsInsert
}

function toAuditLogsUpdate(dto: Partial<AuditLogsDTO>): AuditLogsUpdate {
  return toAuditLogsInsert(dto) as AuditLogsUpdate
}

export { fromAuditLogsRow, toAuditLogsInsert, toAuditLogsUpdate }
