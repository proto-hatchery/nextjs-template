// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { PatientDeletionAuditLogDTO } from "@workspace/supabase-data/modules/audit/domain/dto/patient-deletion-audit-log.dto.codegen"
import type {
  PatientDeletionAuditLogRepository,
  PatientDeletionAuditLogListParams,
  PatientDeletionAuditLogListResult,
} from "@workspace/supabase-data/modules/audit/domain/ports/patient-deletion-audit-log-repository.port.codegen"
import { fromPatientDeletionAuditLogRow } from "@workspace/supabase-data/modules/audit/infrastructure/mappers/patient-deletion-audit-log.mapper.codegen"

class PatientDeletionAuditLogSupabaseRepository implements PatientDeletionAuditLogRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<PatientDeletionAuditLogDTO | null> {
    const { data, error } = await this.supabase
      .from("patient_deletion_audit_log")
      .select("cleanup_timestamp, created_at, deleted_count, id, notes, triggered_by")
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load patient_deletion_audit_log.", {
        cause: error,
      })
    }
    if (!data) return null
    return fromPatientDeletionAuditLogRow(data)
  }

  async list(
    params: PatientDeletionAuditLogListParams
  ): Promise<PatientDeletionAuditLogListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("patient_deletion_audit_log")
      .select("cleanup_timestamp, created_at, deleted_count, id, notes, triggered_by")
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list patient_deletion_audit_log.", {
        cause: error,
      })
    }
    const rows = (data ?? []).map((row) => fromPatientDeletionAuditLogRow(row))
    return { rows }
  }
}

export { PatientDeletionAuditLogSupabaseRepository }
