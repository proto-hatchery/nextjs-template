// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { AuditLogsDTO } from "@workspace/supabase-data/modules/audit/domain/dto/audit-logs.dto.codegen"
import type {
  AuditLogsRepository,
  AuditLogsListParams,
  AuditLogsListResult,
} from "@workspace/supabase-data/modules/audit/domain/ports/audit-logs-repository.port.codegen"
import { fromAuditLogsRow } from "@workspace/supabase-data/modules/audit/infrastructure/mappers/audit-logs.mapper.codegen"

class AuditLogsSupabaseRepository implements AuditLogsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<AuditLogsDTO | null> {
    const { data, error } = await this.supabase
      .from("audit_logs")
      .select(
        "action, changed_fields, correlation_id, created_at, id, ip_address, record_id, table_name, user_agent, user_id, user_type"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load audit_logs.", { cause: error })
    }
    if (!data) return null
    return fromAuditLogsRow(data)
  }

  async list(params: AuditLogsListParams): Promise<AuditLogsListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("audit_logs")
      .select(
        "action, changed_fields, correlation_id, created_at, id, ip_address, record_id, table_name, user_agent, user_id, user_type"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list audit_logs.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromAuditLogsRow(row))
    return { rows }
  }
}

export { AuditLogsSupabaseRepository }
