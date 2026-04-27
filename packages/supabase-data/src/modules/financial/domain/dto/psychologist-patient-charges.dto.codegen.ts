// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const PsychologistPatientChargesDTOSchema = z.object({
  attachmentUrl: looseCell,
  createdAt: looseCell,
  createdBy: looseCell,
  description: looseCell,
  documentStatus: looseCell,
  dueDate: looseCell,
  id: looseCell,
  invoiceNumber: looseCell,
  invoiceUrl: looseCell,
  lastSentAt: looseCell,
  paidAt: looseCell,
  paymentMethod: looseCell,
  paymentNotes: looseCell,
  paymentStatus: looseCell,
  priceCents: looseCell,
  psychologistId: looseCell,
  psychologistPatientId: looseCell,
  sentCount: looseCell,
  sessionId: looseCell,
  updatedAt: looseCell,
  updatedBy: looseCell,
})

type PsychologistPatientChargesDTO = z.infer<typeof PsychologistPatientChargesDTOSchema>

export { PsychologistPatientChargesDTOSchema, type PsychologistPatientChargesDTO }
