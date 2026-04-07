// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { Database } from "@workspace/supabase-infra/types/database"

import { PatientDeletionAuditLogDTOSchema, type PatientDeletionAuditLogDTO } from "@workspace/supabase-data/modules/audit/domain/dto/patient-deletion-audit-log.dto.codegen"

type PatientDeletionAuditLogRow = Database["public"]["Tables"]["patient_deletion_audit_log"]["Row"]
type PatientDeletionAuditLogInsert = Database["public"]["Tables"]["patient_deletion_audit_log"]["Insert"]
type PatientDeletionAuditLogUpdate = Database["public"]["Tables"]["patient_deletion_audit_log"]["Update"]

const PatientDeletionAuditLogFieldMappings = {
  cleanupTimestamp: "cleanup_timestamp",
  createdAt: "created_at",
  deletedCount: "deleted_count",
  id: "id",
  notes: "notes",
  triggeredBy: "triggered_by",
} as const

type PatientDeletionAuditLogField = keyof typeof PatientDeletionAuditLogFieldMappings

function fromPatientDeletionAuditLogRow(row: PatientDeletionAuditLogRow): PatientDeletionAuditLogDTO {
  const mapped = {
    cleanupTimestamp: row.cleanup_timestamp,
    createdAt: row.created_at,
    deletedCount: row.deleted_count,
    id: row.id,
    notes: row.notes,
    triggeredBy: row.triggered_by,
  }
  return PatientDeletionAuditLogDTOSchema.parse(mapped)
}

function toPatientDeletionAuditLogInsert(dto: Partial<PatientDeletionAuditLogDTO>): PatientDeletionAuditLogInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(PatientDeletionAuditLogFieldMappings) as Array<
    [PatientDeletionAuditLogField, (typeof PatientDeletionAuditLogFieldMappings)[PatientDeletionAuditLogField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as PatientDeletionAuditLogInsert
}

function toPatientDeletionAuditLogUpdate(dto: Partial<PatientDeletionAuditLogDTO>): PatientDeletionAuditLogUpdate {
  return toPatientDeletionAuditLogInsert(dto) as PatientDeletionAuditLogUpdate
}

export { fromPatientDeletionAuditLogRow, toPatientDeletionAuditLogInsert, toPatientDeletionAuditLogUpdate }
