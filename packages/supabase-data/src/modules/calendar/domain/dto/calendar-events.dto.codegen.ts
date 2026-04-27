// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const CalendarEventsDTOSchema = z.object({
  allDay: looseCell,
  attendanceConfirmed: looseCell,
  billingStatus: looseCell,
  clinicalSessionId: looseCell,
  color: looseCell,
  createdAt: looseCell,
  description: looseCell,
  durationMinutes: looseCell,
  endDatetime: looseCell,
  eventType: looseCell,
  googleEventId: looseCell,
  googleSyncError: looseCell,
  googleSyncStatus: looseCell,
  id: looseCell,
  lastSyncedAt: looseCell,
  location: looseCell,
  metadata: looseCell,
  originalEndDatetime: looseCell,
  originalStartDatetime: looseCell,
  patientDisplayName: looseCell,
  patientName: looseCell,
  privateNotes: looseCell,
  psychologistId: looseCell,
  psychologistPatientId: looseCell,
  psychologistServiceId: looseCell,
  seriesId: looseCell,
  serviceDuration: looseCell,
  serviceName: looseCell,
  servicePrice: looseCell,
  sessionNumber: looseCell,
  source: looseCell,
  startDatetime: looseCell,
  status: looseCell,
  timezone: looseCell,
  title: looseCell,
  updatedAt: looseCell,
})

type CalendarEventsDTO = z.infer<typeof CalendarEventsDTOSchema>

export { CalendarEventsDTOSchema, type CalendarEventsDTO }
