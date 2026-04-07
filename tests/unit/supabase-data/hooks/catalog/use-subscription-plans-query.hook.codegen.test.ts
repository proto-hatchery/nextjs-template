/**
 * Unit tests for useSubscriptionPlansQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useSubscriptionPlansQuery } from "@workspace/supabase-data/hooks/catalog/use-subscription-plans-query.hook.codegen"
import { catalogQueryKeys } from "@workspace/supabase-data/hooks/catalog/query-keys.codegen"

describe("useSubscriptionPlansQuery", () => {
  it("should export the generated hook", () => {
    expect(useSubscriptionPlansQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(catalogQueryKeys.subscriptionPlansList({})).toBeDefined()
  })
})
