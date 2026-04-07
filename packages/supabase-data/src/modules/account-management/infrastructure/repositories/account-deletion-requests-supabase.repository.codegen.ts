// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"

import type { AccountDeletionRequestsRepository, AccountDeletionRequestsListParams, AccountDeletionRequestsListResult } from "@workspace/supabase-data/modules/account-management/domain/ports/account-deletion-requests-repository.port.codegen"
import { fromAccountDeletionRequestsRow, toAccountDeletionRequestsInsert, toAccountDeletionRequestsUpdate } from "@workspace/supabase-data/modules/account-management/infrastructure/mappers/account-deletion-requests.mapper.codegen"
import type { AccountDeletionRequestsDTO } from "@workspace/supabase-data/modules/account-management/domain/dto/account-deletion-requests.dto.codegen"

class AccountDeletionRequestsSupabaseRepository implements AccountDeletionRequestsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<AccountDeletionRequestsDTO | null> {
    const { data, error } = await this.supabase
      .from("account_deletion_requests")
      .select("approved_at, cancelled_at, correlation_id, failed_at, failure_reason, id, metadata, processed_at, processing_started_at, reason, requested_at, requested_by, retention_until, status, user_id")
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load account_deletion_requests.", { cause: error })
    }
    if (!data) return null
    return fromAccountDeletionRequestsRow(data)
  }

  async list(params: AccountDeletionRequestsListParams): Promise<AccountDeletionRequestsListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase.from("account_deletion_requests").select("approved_at, cancelled_at, correlation_id, failed_at, failure_reason, id, metadata, processed_at, processing_started_at, reason, requested_at, requested_by, retention_until, status, user_id").range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list account_deletion_requests.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromAccountDeletionRequestsRow(row))
    return { rows }
  }

  async insert(data: Partial<AccountDeletionRequestsDTO>): Promise<AccountDeletionRequestsDTO> {
    const payload = toAccountDeletionRequestsInsert(data)
    const { data: row, error } = await this.supabase
      .from("account_deletion_requests")
      .insert(payload)
      .select("approved_at, cancelled_at, correlation_id, failed_at, failure_reason, id, metadata, processed_at, processing_started_at, reason, requested_at, requested_by, retention_until, status, user_id")
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert account_deletion_requests.", { cause: error })
    }
    return fromAccountDeletionRequestsRow(row)
  }

  async update(id: string, patch: Partial<AccountDeletionRequestsDTO>): Promise<AccountDeletionRequestsDTO> {
    const payload = toAccountDeletionRequestsUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("account_deletion_requests")
      .update(payload)
      .eq("id", id)
      .select("approved_at, cancelled_at, correlation_id, failed_at, failure_reason, id, metadata, processed_at, processing_started_at, reason, requested_at, requested_by, retention_until, status, user_id")
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update account_deletion_requests.", { cause: error })
    }
    return fromAccountDeletionRequestsRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("account_deletion_requests").delete().eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete account_deletion_requests.", { cause: error })
    }
  }

}

export { AccountDeletionRequestsSupabaseRepository }
