// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const CalendarChangeLogDTOSchema = z.object({
  createdAt: looseCell,
  googleEventId: looseCell,
  id: looseCell,
  modificationHash: looseCell,
  processedAt: looseCell,
  psychologistId: looseCell,
  syncDirection: looseCell
})

type CalendarChangeLogDTO = z.infer<typeof CalendarChangeLogDTOSchema>

export { CalendarChangeLogDTOSchema, type CalendarChangeLogDTO }
