// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const ObservabilityEventsDTOSchema = z.object({
  actorIdHash: looseCell,
  actorType: looseCell,
  component: looseCell,
  correlationId: looseCell,
  correlationProvenance: looseCell,
  durationMs: looseCell,
  environment: looseCell,
  errorCategory: looseCell,
  errorCode: looseCell,
  errorMessage: looseCell,
  eventFamily: looseCell,
  eventName: looseCell,
  httpStatus: looseCell,
  id: looseCell,
  ipHash: looseCell,
  metadata: looseCell,
  operation: looseCell,
  operationType: looseCell,
  outcome: looseCell,
  requestPath: looseCell,
  role: looseCell,
  runtime: looseCell,
  service: looseCell,
  severity: looseCell,
  timestamp: looseCell,
  traceId: looseCell,
  userAgent: looseCell
})

type ObservabilityEventsDTO = z.infer<typeof ObservabilityEventsDTOSchema>

export { ObservabilityEventsDTOSchema, type ObservabilityEventsDTO }
