// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  SubscriptionPlansDTOSchema,
  type SubscriptionPlansDTO,
} from "@workspace/supabase-data/modules/catalog/domain/dto/subscription-plans.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type SubscriptionPlansRow = Database["public"]["Tables"]["subscription_plans"]["Row"]

const SubscriptionPlansFieldMappings = {
  amountCents: "amount_cents",
  createdAt: "created_at",
  currency: "currency",
  description: "description",
  features: "features",
  id: "id",
  interval: "interval",
  intervalCount: "interval_count",
  isActive: "is_active",
  metadata: "metadata",
  name: "name",
  planName: "plan_name",
  stripePriceId: "stripe_price_id",
  stripeProductId: "stripe_product_id",
  subscriptionPlanId: "subscription_plan_id",
  updatedAt: "updated_at",
} as const

type _SubscriptionPlansField = keyof typeof SubscriptionPlansFieldMappings

function fromSubscriptionPlansRow(row: SubscriptionPlansRow): SubscriptionPlansDTO {
  const mapped = {
    amountCents: row.amount_cents,
    createdAt: row.created_at,
    currency: row.currency,
    description: row.description,
    features: row.features,
    id: row.id,
    interval: row.interval,
    intervalCount: row.interval_count,
    isActive: row.is_active,
    metadata: row.metadata,
    name: row.name,
    planName: row.plan_name,
    stripePriceId: row.stripe_price_id,
    stripeProductId: row.stripe_product_id,
    subscriptionPlanId: row.subscription_plan_id,
    updatedAt: row.updated_at,
  }
  return SubscriptionPlansDTOSchema.parse(mapped)
}

export { fromSubscriptionPlansRow }
