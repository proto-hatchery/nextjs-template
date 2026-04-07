// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { Database } from "@workspace/supabase-infra/types/database"

import { SubscriptionPlansDTOSchema, type SubscriptionPlansDTO } from "@workspace/supabase-data/modules/catalog/domain/dto/subscription-plans.dto.codegen"

type SubscriptionPlansRow = Database["public"]["Tables"]["subscription_plans"]["Row"]
type SubscriptionPlansInsert = Database["public"]["Tables"]["subscription_plans"]["Insert"]
type SubscriptionPlansUpdate = Database["public"]["Tables"]["subscription_plans"]["Update"]

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

type SubscriptionPlansField = keyof typeof SubscriptionPlansFieldMappings

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

function toSubscriptionPlansInsert(dto: Partial<SubscriptionPlansDTO>): SubscriptionPlansInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(SubscriptionPlansFieldMappings) as Array<
    [SubscriptionPlansField, (typeof SubscriptionPlansFieldMappings)[SubscriptionPlansField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as SubscriptionPlansInsert
}

function toSubscriptionPlansUpdate(dto: Partial<SubscriptionPlansDTO>): SubscriptionPlansUpdate {
  return toSubscriptionPlansInsert(dto) as SubscriptionPlansUpdate
}

export { fromSubscriptionPlansRow, toSubscriptionPlansInsert, toSubscriptionPlansUpdate }
