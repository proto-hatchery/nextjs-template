// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { PsychologistPreferencesAuditLogDTO } from "@workspace/supabase-data/modules/audit/domain/dto/psychologist-preferences-audit-log.dto.codegen"
import type {
  PsychologistPreferencesAuditLogRepository,
  PsychologistPreferencesAuditLogListParams,
  PsychologistPreferencesAuditLogListResult,
} from "@workspace/supabase-data/modules/audit/domain/ports/psychologist-preferences-audit-log-repository.port.codegen"
import { fromPsychologistPreferencesAuditLogRow } from "@workspace/supabase-data/modules/audit/infrastructure/mappers/psychologist-preferences-audit-log.mapper.codegen"

class PsychologistPreferencesAuditLogSupabaseRepository implements PsychologistPreferencesAuditLogRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<PsychologistPreferencesAuditLogDTO | null> {
    const { data, error } = await this.supabase
      .from("psychologist_preferences_audit_log")
      .select("action, created_at, id, new_values, old_values, user_id")
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load psychologist_preferences_audit_log.", {
        cause: error,
      })
    }
    if (!data) return null
    return fromPsychologistPreferencesAuditLogRow(data)
  }

  async list(
    params: PsychologistPreferencesAuditLogListParams
  ): Promise<PsychologistPreferencesAuditLogListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("psychologist_preferences_audit_log")
      .select("action, created_at, id, new_values, old_values, user_id")
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list psychologist_preferences_audit_log.", {
        cause: error,
      })
    }
    const rows = (data ?? []).map((row) => fromPsychologistPreferencesAuditLogRow(row))
    return { rows }
  }
}

export { PsychologistPreferencesAuditLogSupabaseRepository }
