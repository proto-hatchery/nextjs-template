// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const TherapeuticSessionEventsDTOSchema = z.object({
  allDay: looseCell,
  attendanceConfirmed: looseCell,
  billingAttemptCount: looseCell,
  billingLastAttemptAt: looseCell,
  billingLastError: looseCell,
  billingNextAttemptAt: looseCell,
  billingStatus: looseCell,
  calendarEventId: looseCell,
  clinicalSessionId: looseCell,
  color: looseCell,
  confirmationSentAt: looseCell,
  createdAt: looseCell,
  description: looseCell,
  durationMinutes: looseCell,
  endDatetime: looseCell,
  googleEventId: looseCell,
  googleSyncError: looseCell,
  googleSyncStatus: looseCell,
  lastSyncedAt: looseCell,
  legacySessionId: looseCell,
  location: looseCell,
  metadata: looseCell,
  patientDisplayName: looseCell,
  patientName: looseCell,
  privateNotes: looseCell,
  psychologistId: looseCell,
  psychologistPatientId: looseCell,
  psychologistServiceId: looseCell,
  reminderSentAt: looseCell,
  schedulingStatus: looseCell,
  seriesId: looseCell,
  serviceDuration: looseCell,
  serviceName: looseCell,
  servicePrice: looseCell,
  sessionDetailId: looseCell,
  sessionNumber: looseCell,
  sessionTypeId: looseCell,
  source: looseCell,
  startDatetime: looseCell,
  timezone: looseCell,
  title: looseCell,
  updatedAt: looseCell,
})

type TherapeuticSessionEventsDTO = z.infer<typeof TherapeuticSessionEventsDTOSchema>

export { TherapeuticSessionEventsDTOSchema, type TherapeuticSessionEventsDTO }
