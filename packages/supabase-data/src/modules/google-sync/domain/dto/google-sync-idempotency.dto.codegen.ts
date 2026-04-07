// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const GoogleSyncIdempotencyDTOSchema = z.object({
  calendarEventId: looseCell,
  completedAt: looseCell,
  createdAt: looseCell,
  errorMessage: looseCell,
  expiresAt: looseCell,
  idempotencyKey: looseCell,
  operation: looseCell,
  psychologistId: looseCell,
  requestData: looseCell,
  responseData: looseCell,
  status: looseCell,
  updatedAt: looseCell
})

type GoogleSyncIdempotencyDTO = z.infer<typeof GoogleSyncIdempotencyDTOSchema>

export { GoogleSyncIdempotencyDTOSchema, type GoogleSyncIdempotencyDTO }
