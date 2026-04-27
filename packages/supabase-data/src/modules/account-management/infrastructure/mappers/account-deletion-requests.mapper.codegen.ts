// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  AccountDeletionRequestsDTOSchema,
  type AccountDeletionRequestsDTO,
} from "@workspace/supabase-data/modules/account-management/domain/dto/account-deletion-requests.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type AccountDeletionRequestsRow = Database["public"]["Tables"]["account_deletion_requests"]["Row"]
type AccountDeletionRequestsInsert =
  Database["public"]["Tables"]["account_deletion_requests"]["Insert"]
type AccountDeletionRequestsUpdate =
  Database["public"]["Tables"]["account_deletion_requests"]["Update"]

const AccountDeletionRequestsFieldMappings = {
  approvedAt: "approved_at",
  cancelledAt: "cancelled_at",
  correlationId: "correlation_id",
  failedAt: "failed_at",
  failureReason: "failure_reason",
  id: "id",
  metadata: "metadata",
  processedAt: "processed_at",
  processingStartedAt: "processing_started_at",
  reason: "reason",
  requestedAt: "requested_at",
  requestedBy: "requested_by",
  retentionUntil: "retention_until",
  status: "status",
  userId: "user_id",
} as const

type AccountDeletionRequestsField = keyof typeof AccountDeletionRequestsFieldMappings

function fromAccountDeletionRequestsRow(
  row: AccountDeletionRequestsRow
): AccountDeletionRequestsDTO {
  const mapped = {
    approvedAt: row.approved_at,
    cancelledAt: row.cancelled_at,
    correlationId: row.correlation_id,
    failedAt: row.failed_at,
    failureReason: row.failure_reason,
    id: row.id,
    metadata: row.metadata,
    processedAt: row.processed_at,
    processingStartedAt: row.processing_started_at,
    reason: row.reason,
    requestedAt: row.requested_at,
    requestedBy: row.requested_by,
    retentionUntil: row.retention_until,
    status: row.status,
    userId: row.user_id,
  }
  return AccountDeletionRequestsDTOSchema.parse(mapped)
}

function toAccountDeletionRequestsInsert(
  dto: Partial<AccountDeletionRequestsDTO>
): AccountDeletionRequestsInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(AccountDeletionRequestsFieldMappings) as Array<
    [
      AccountDeletionRequestsField,
      (typeof AccountDeletionRequestsFieldMappings)[AccountDeletionRequestsField],
    ]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as AccountDeletionRequestsInsert
}

function toAccountDeletionRequestsUpdate(
  dto: Partial<AccountDeletionRequestsDTO>
): AccountDeletionRequestsUpdate {
  return toAccountDeletionRequestsInsert(dto) as AccountDeletionRequestsUpdate
}

export {
  fromAccountDeletionRequestsRow,
  toAccountDeletionRequestsInsert,
  toAccountDeletionRequestsUpdate,
}
