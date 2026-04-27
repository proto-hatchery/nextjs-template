// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const CalendarHolidaysDTOSchema = z.object({
  city: looseCell,
  createdAt: looseCell,
  date: looseCell,
  description: looseCell,
  id: looseCell,
  name: looseCell,
  source: looseCell,
  state: looseCell,
  type: looseCell,
  updatedAt: looseCell,
  year: looseCell,
})

type CalendarHolidaysDTO = z.infer<typeof CalendarHolidaysDTOSchema>

export { CalendarHolidaysDTOSchema, type CalendarHolidaysDTO }
