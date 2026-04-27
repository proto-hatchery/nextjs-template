// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const AvailabilityExceptionsDTOSchema = z.object({
  createdAt: looseCell,
  endTime: looseCell,
  exceptionDate: looseCell,
  id: looseCell,
  isAvailable: looseCell,
  psychologistId: looseCell,
  reason: looseCell,
  startTime: looseCell,
  updatedAt: looseCell,
})

type AvailabilityExceptionsDTO = z.infer<typeof AvailabilityExceptionsDTOSchema>

export { AvailabilityExceptionsDTOSchema, type AvailabilityExceptionsDTO }
