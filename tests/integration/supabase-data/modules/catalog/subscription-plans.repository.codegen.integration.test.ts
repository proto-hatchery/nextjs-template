// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { SubscriptionPlansSupabaseRepository } from "@workspace/supabase-data/modules/catalog/infrastructure/repositories/subscription-plans-supabase.repository.codegen"

describe.skip("subscription-plans repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void SubscriptionPlansSupabaseRepository
  })
})
