// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SubscriptionPlansDTO } from "@workspace/supabase-data/modules/catalog/domain/dto/subscription-plans.dto.codegen"

export interface SubscriptionPlansListParams {
  limit?: number
  offset?: number
}

export interface SubscriptionPlansListResult {
  rows: SubscriptionPlansDTO[]
}

interface SubscriptionPlansRepository {
  findById(id: string): Promise<SubscriptionPlansDTO | null>
  list(params: SubscriptionPlansListParams): Promise<SubscriptionPlansListResult>
}

export { type SubscriptionPlansRepository }
