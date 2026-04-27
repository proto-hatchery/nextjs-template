// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const PsychologistClinicalSessionsDTOSchema = z.object({
  attendanceConfirmed: looseCell,
  automationMetadata: looseCell,
  billingAttemptCount: looseCell,
  billingLastError: looseCell,
  billingNextAttemptAt: looseCell,
  billingStatus: looseCell,
  calendarEventId: looseCell,
  confirmationSentAt: looseCell,
  createdAt: looseCell,
  createdBy: looseCell,
  customPriceCents: looseCell,
  defaultChargeId: looseCell,
  durationMinutes: looseCell,
  id: looseCell,
  locationId: looseCell,
  noteId: looseCell,
  notes: looseCell,
  psychologistId: looseCell,
  psychologistPatientId: looseCell,
  psychologistServiceId: looseCell,
  reminderSentAt: looseCell,
  sessionNumber: looseCell,
  snapshotPrice: looseCell,
  snapshotPriceCents: looseCell,
  snapshotServiceName: looseCell,
  startTime: looseCell,
  status: looseCell,
  statusReason: looseCell,
  updatedAt: looseCell,
  updatedBy: looseCell,
})

type PsychologistClinicalSessionsDTO = z.infer<typeof PsychologistClinicalSessionsDTOSchema>

export { PsychologistClinicalSessionsDTOSchema, type PsychologistClinicalSessionsDTO }
