/**
 * Unit tests for useGoogleSyncIdempotencyQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useGoogleSyncIdempotencyQuery } from "@workspace/supabase-data/hooks/google-sync/use-google-sync-idempotency-query.hook.codegen"
import { googleSyncQueryKeys } from "@workspace/supabase-data/hooks/google-sync/query-keys.codegen"

describe("useGoogleSyncIdempotencyQuery", () => {
  it("should export the generated hook", () => {
    expect(useGoogleSyncIdempotencyQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(googleSyncQueryKeys.googleSyncIdempotencyList({})).toBeDefined()
  })
})
