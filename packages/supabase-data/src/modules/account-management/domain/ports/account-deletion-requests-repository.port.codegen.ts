// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { AccountDeletionRequestsDTO } from "@workspace/supabase-data/modules/account-management/domain/dto/account-deletion-requests.dto.codegen"

export interface AccountDeletionRequestsListParams {
  limit?: number
  offset?: number
}

export interface AccountDeletionRequestsListResult {
  rows: AccountDeletionRequestsDTO[]
}

interface AccountDeletionRequestsRepository {
  findById(id: string): Promise<AccountDeletionRequestsDTO | null>
  list(params: AccountDeletionRequestsListParams): Promise<AccountDeletionRequestsListResult>
  insert(data: Partial<AccountDeletionRequestsDTO>): Promise<AccountDeletionRequestsDTO>
  update(
    id: string,
    patch: Partial<AccountDeletionRequestsDTO>
  ): Promise<AccountDeletionRequestsDTO>
}

export { type AccountDeletionRequestsRepository }
