// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { EncryptionAuditLogDTO } from "@workspace/supabase-data/modules/audit/domain/dto/encryption-audit-log.dto.codegen"
import type {
  EncryptionAuditLogRepository,
  EncryptionAuditLogListParams,
  EncryptionAuditLogListResult,
} from "@workspace/supabase-data/modules/audit/domain/ports/encryption-audit-log-repository.port.codegen"
import { fromEncryptionAuditLogRow } from "@workspace/supabase-data/modules/audit/infrastructure/mappers/encryption-audit-log.mapper.codegen"

class EncryptionAuditLogSupabaseRepository implements EncryptionAuditLogRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<EncryptionAuditLogDTO | null> {
    const { data, error } = await this.supabase
      .from("encryption_audit_log")
      .select(
        "attempted_at, caller_role, caller_user_id, context, error_message, id, operation, success"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load encryption_audit_log.", { cause: error })
    }
    if (!data) return null
    return fromEncryptionAuditLogRow(data)
  }

  async list(params: EncryptionAuditLogListParams): Promise<EncryptionAuditLogListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("encryption_audit_log")
      .select(
        "attempted_at, caller_role, caller_user_id, context, error_message, id, operation, success"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list encryption_audit_log.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromEncryptionAuditLogRow(row))
    return { rows }
  }
}

export { EncryptionAuditLogSupabaseRepository }
