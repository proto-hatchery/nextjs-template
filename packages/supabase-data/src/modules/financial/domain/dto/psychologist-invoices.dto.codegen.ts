// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const PsychologistInvoicesDTOSchema = z.object({
  amountPaid: looseCell,
  createdAt: looseCell,
  currency: looseCell,
  hostedInvoiceUrl: looseCell,
  id: looseCell,
  invoicePdf: looseCell,
  periodEnd: looseCell,
  periodStart: looseCell,
  psychologistId: looseCell,
  status: looseCell,
  stripeInvoiceId: looseCell,
  stripeSubscriptionId: looseCell,
  updatedAt: looseCell,
})

type PsychologistInvoicesDTO = z.infer<typeof PsychologistInvoicesDTOSchema>

export { PsychologistInvoicesDTOSchema, type PsychologistInvoicesDTO }
