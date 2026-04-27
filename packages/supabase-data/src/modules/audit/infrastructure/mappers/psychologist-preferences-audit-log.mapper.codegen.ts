// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  PsychologistPreferencesAuditLogDTOSchema,
  type PsychologistPreferencesAuditLogDTO,
} from "@workspace/supabase-data/modules/audit/domain/dto/psychologist-preferences-audit-log.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type PsychologistPreferencesAuditLogRow =
  Database["public"]["Tables"]["psychologist_preferences_audit_log"]["Row"]

const PsychologistPreferencesAuditLogFieldMappings = {
  action: "action",
  createdAt: "created_at",
  id: "id",
  newValues: "new_values",
  oldValues: "old_values",
  userId: "user_id",
} as const

type _PsychologistPreferencesAuditLogField =
  keyof typeof PsychologistPreferencesAuditLogFieldMappings

function fromPsychologistPreferencesAuditLogRow(
  row: PsychologistPreferencesAuditLogRow
): PsychologistPreferencesAuditLogDTO {
  const mapped = {
    action: row.action,
    createdAt: row.created_at,
    id: row.id,
    newValues: row.new_values,
    oldValues: row.old_values,
    userId: row.user_id,
  }
  return PsychologistPreferencesAuditLogDTOSchema.parse(mapped)
}

export { fromPsychologistPreferencesAuditLogRow }
