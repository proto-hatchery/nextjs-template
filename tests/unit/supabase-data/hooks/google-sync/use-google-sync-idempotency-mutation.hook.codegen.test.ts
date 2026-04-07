/**
 * Unit tests for useGoogleSyncIdempotencyMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useGoogleSyncIdempotencyMutation } from "@workspace/supabase-data/hooks/google-sync/use-google-sync-idempotency-mutation.hook.codegen"
import { googleSyncQueryKeys } from "@workspace/supabase-data/hooks/google-sync/query-keys.codegen"

describe("useGoogleSyncIdempotencyMutation", () => {
  it("should export the generated hook", () => {
    expect(useGoogleSyncIdempotencyMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(googleSyncQueryKeys.googleSyncIdempotency()).toBeDefined()
  })
})
