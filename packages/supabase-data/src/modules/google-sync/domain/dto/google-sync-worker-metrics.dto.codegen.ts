// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const GoogleSyncWorkerMetricsDTOSchema = z.object({
  backlogAfter: looseCell,
  batchSize: looseCell,
  durationMs: looseCell,
  failed: looseCell,
  id: looseCell,
  metadata: looseCell,
  queueName: looseCell,
  recordedAt: looseCell,
  requeued: looseCell,
  skipped: looseCell,
  successful: looseCell,
  workerId: looseCell
})

type GoogleSyncWorkerMetricsDTO = z.infer<typeof GoogleSyncWorkerMetricsDTOSchema>

export { GoogleSyncWorkerMetricsDTOSchema, type GoogleSyncWorkerMetricsDTO }
