// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { Database } from "@workspace/supabase-infra/types/database"

import { PsychologistPreferencesAuditLogDTOSchema, type PsychologistPreferencesAuditLogDTO } from "@workspace/supabase-data/modules/audit/domain/dto/psychologist-preferences-audit-log.dto.codegen"

type PsychologistPreferencesAuditLogRow = Database["public"]["Tables"]["psychologist_preferences_audit_log"]["Row"]
type PsychologistPreferencesAuditLogInsert = Database["public"]["Tables"]["psychologist_preferences_audit_log"]["Insert"]
type PsychologistPreferencesAuditLogUpdate = Database["public"]["Tables"]["psychologist_preferences_audit_log"]["Update"]

const PsychologistPreferencesAuditLogFieldMappings = {
  action: "action",
  createdAt: "created_at",
  id: "id",
  newValues: "new_values",
  oldValues: "old_values",
  userId: "user_id",
} as const

type PsychologistPreferencesAuditLogField = keyof typeof PsychologistPreferencesAuditLogFieldMappings

function fromPsychologistPreferencesAuditLogRow(row: PsychologistPreferencesAuditLogRow): PsychologistPreferencesAuditLogDTO {
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

function toPsychologistPreferencesAuditLogInsert(dto: Partial<PsychologistPreferencesAuditLogDTO>): PsychologistPreferencesAuditLogInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(PsychologistPreferencesAuditLogFieldMappings) as Array<
    [PsychologistPreferencesAuditLogField, (typeof PsychologistPreferencesAuditLogFieldMappings)[PsychologistPreferencesAuditLogField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as PsychologistPreferencesAuditLogInsert
}

function toPsychologistPreferencesAuditLogUpdate(dto: Partial<PsychologistPreferencesAuditLogDTO>): PsychologistPreferencesAuditLogUpdate {
  return toPsychologistPreferencesAuditLogInsert(dto) as PsychologistPreferencesAuditLogUpdate
}

export { fromPsychologistPreferencesAuditLogRow, toPsychologistPreferencesAuditLogInsert, toPsychologistPreferencesAuditLogUpdate }
