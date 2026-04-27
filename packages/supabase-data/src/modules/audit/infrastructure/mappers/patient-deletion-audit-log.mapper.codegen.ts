// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  PatientDeletionAuditLogDTOSchema,
  type PatientDeletionAuditLogDTO,
} from "@workspace/supabase-data/modules/audit/domain/dto/patient-deletion-audit-log.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type PatientDeletionAuditLogRow = Database["public"]["Tables"]["patient_deletion_audit_log"]["Row"]

const PatientDeletionAuditLogFieldMappings = {
  cleanupTimestamp: "cleanup_timestamp",
  createdAt: "created_at",
  deletedCount: "deleted_count",
  id: "id",
  notes: "notes",
  triggeredBy: "triggered_by",
} as const

type _PatientDeletionAuditLogField = keyof typeof PatientDeletionAuditLogFieldMappings

function fromPatientDeletionAuditLogRow(
  row: PatientDeletionAuditLogRow
): PatientDeletionAuditLogDTO {
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

export { fromPatientDeletionAuditLogRow }
