// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const CalendarEventSeriesExceptionsDTOSchema = z.object({
  createdAt: looseCell,
  exceptionType: looseCell,
  id: looseCell,
  modifiedFields: looseCell,
  newEndDatetime: looseCell,
  newStartDatetime: looseCell,
  originalDate: looseCell,
  reason: looseCell,
  seriesId: looseCell,
})

type CalendarEventSeriesExceptionsDTO = z.infer<typeof CalendarEventSeriesExceptionsDTOSchema>

export { CalendarEventSeriesExceptionsDTOSchema, type CalendarEventSeriesExceptionsDTO }
