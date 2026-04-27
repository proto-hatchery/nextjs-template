// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const AccountDeletionRequestsDTOSchema = z.object({
  approvedAt: looseCell,
  cancelledAt: looseCell,
  correlationId: looseCell,
  failedAt: looseCell,
  failureReason: looseCell,
  id: looseCell,
  metadata: looseCell,
  processedAt: looseCell,
  processingStartedAt: looseCell,
  reason: looseCell,
  requestedAt: looseCell,
  requestedBy: looseCell,
  retentionUntil: looseCell,
  status: looseCell,
  userId: looseCell,
})

type AccountDeletionRequestsDTO = z.infer<typeof AccountDeletionRequestsDTOSchema>

export { AccountDeletionRequestsDTOSchema, type AccountDeletionRequestsDTO }
