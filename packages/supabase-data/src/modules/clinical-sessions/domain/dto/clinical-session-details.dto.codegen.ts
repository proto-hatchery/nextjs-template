// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const ClinicalSessionDetailsDTOSchema = z.object({
  attendanceConfirmed: looseCell,
  billingAttemptCount: looseCell,
  billingLastAttemptAt: looseCell,
  billingLastError: looseCell,
  billingNextAttemptAt: looseCell,
  billingStatus: looseCell,
  calendarEventId: looseCell,
  clinicalSessionId: looseCell,
  confirmationSentAt: looseCell,
  createdAt: looseCell,
  id: looseCell,
  patientId: looseCell,
  psychologistClientId: looseCell,
  psychologistServiceId: looseCell,
  reminderSentAt: looseCell,
  sessionNumber: looseCell,
  sessionTypeId: looseCell,
  updatedAt: looseCell,
})

type ClinicalSessionDetailsDTO = z.infer<typeof ClinicalSessionDetailsDTOSchema>

export { ClinicalSessionDetailsDTOSchema, type ClinicalSessionDetailsDTO }
