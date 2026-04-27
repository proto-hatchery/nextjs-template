// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const SubscriptionPlansDTOSchema = z.object({
  amountCents: looseCell,
  createdAt: looseCell,
  currency: looseCell,
  description: looseCell,
  features: looseCell,
  id: looseCell,
  interval: looseCell,
  intervalCount: looseCell,
  isActive: looseCell,
  metadata: looseCell,
  name: looseCell,
  planName: looseCell,
  stripePriceId: looseCell,
  stripeProductId: looseCell,
  subscriptionPlanId: looseCell,
  updatedAt: looseCell,
})

type SubscriptionPlansDTO = z.infer<typeof SubscriptionPlansDTOSchema>

export { SubscriptionPlansDTOSchema, type SubscriptionPlansDTO }
