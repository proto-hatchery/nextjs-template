// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const CalendarEventSeriesDTOSchema = z.object({
  allDay: looseCell,
  color: looseCell,
  createdAt: looseCell,
  description: looseCell,
  durationMinutes: looseCell,
  effectiveEnd: looseCell,
  effectiveStart: looseCell,
  endTime: looseCell,
  eventType: looseCell,
  googleEventId: looseCell,
  googleSyncStatus: looseCell,
  id: looseCell,
  location: looseCell,
  metadata: looseCell,
  psychologistId: looseCell,
  rrule: looseCell,
  startTime: looseCell,
  timezone: looseCell,
  title: looseCell,
  updatedAt: looseCell,
})

type CalendarEventSeriesDTO = z.infer<typeof CalendarEventSeriesDTOSchema>

export { CalendarEventSeriesDTOSchema, type CalendarEventSeriesDTO }
