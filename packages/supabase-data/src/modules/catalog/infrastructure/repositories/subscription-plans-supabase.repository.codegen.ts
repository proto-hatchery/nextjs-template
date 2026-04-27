// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { SubscriptionPlansDTO } from "@workspace/supabase-data/modules/catalog/domain/dto/subscription-plans.dto.codegen"
import type {
  SubscriptionPlansRepository,
  SubscriptionPlansListParams,
  SubscriptionPlansListResult,
} from "@workspace/supabase-data/modules/catalog/domain/ports/subscription-plans-repository.port.codegen"
import { fromSubscriptionPlansRow } from "@workspace/supabase-data/modules/catalog/infrastructure/mappers/subscription-plans.mapper.codegen"

class SubscriptionPlansSupabaseRepository implements SubscriptionPlansRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<SubscriptionPlansDTO | null> {
    const { data, error } = await this.supabase
      .from("subscription_plans")
      .select(
        "amount_cents, created_at, currency, description, features, id, interval, interval_count, is_active, metadata, name, plan_name, stripe_price_id, stripe_product_id, subscription_plan_id, updated_at"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load subscription_plans.", { cause: error })
    }
    if (!data) return null
    return fromSubscriptionPlansRow(data)
  }

  async list(params: SubscriptionPlansListParams): Promise<SubscriptionPlansListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("subscription_plans")
      .select(
        "amount_cents, created_at, currency, description, features, id, interval, interval_count, is_active, metadata, name, plan_name, stripe_price_id, stripe_product_id, subscription_plan_id, updated_at"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list subscription_plans.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromSubscriptionPlansRow(row))
    return { rows }
  }
}

export { SubscriptionPlansSupabaseRepository }
