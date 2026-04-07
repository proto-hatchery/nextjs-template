// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const GoogleSyncJobDedupDTOSchema = z.object({
  idempotencyKey: looseCell,
  outcome: looseCell,
  processedAt: looseCell
})

type GoogleSyncJobDedupDTO = z.infer<typeof GoogleSyncJobDedupDTOSchema>

export { GoogleSyncJobDedupDTOSchema, type GoogleSyncJobDedupDTO }
