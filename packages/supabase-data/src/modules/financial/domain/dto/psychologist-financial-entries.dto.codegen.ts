// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const PsychologistFinancialEntriesDTOSchema = z.object({
  amount: looseCell,
  attachmentUrl: looseCell,
  billingId: looseCell,
  chargeId: looseCell,
  chargesCount: looseCell,
  consolidationType: looseCell,
  createdAt: looseCell,
  createdBy: looseCell,
  dateTime: looseCell,
  description: looseCell,
  id: looseCell,
  isAutomaticallyGenerated: looseCell,
  notes: looseCell,
  parentRecurrenceId: looseCell,
  paymentMethod: looseCell,
  psychologistId: looseCell,
  sessionId: looseCell,
  status: looseCell,
  transactionCategoryId: looseCell,
  type: looseCell,
  updatedAt: looseCell,
  updatedBy: looseCell,
  weeklyPeriodEnd: looseCell,
  weeklyPeriodStart: looseCell,
})

type PsychologistFinancialEntriesDTO = z.infer<typeof PsychologistFinancialEntriesDTOSchema>

export { PsychologistFinancialEntriesDTOSchema, type PsychologistFinancialEntriesDTO }
