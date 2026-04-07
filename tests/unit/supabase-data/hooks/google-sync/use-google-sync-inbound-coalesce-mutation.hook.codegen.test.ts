/**
 * Unit tests for useGoogleSyncInboundCoalesceMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useGoogleSyncInboundCoalesceMutation } from "@workspace/supabase-data/hooks/google-sync/use-google-sync-inbound-coalesce-mutation.hook.codegen"
import { googleSyncQueryKeys } from "@workspace/supabase-data/hooks/google-sync/query-keys.codegen"

describe("useGoogleSyncInboundCoalesceMutation", () => {
  it("should export the generated hook", () => {
    expect(useGoogleSyncInboundCoalesceMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(googleSyncQueryKeys.googleSyncInboundCoalesce()).toBeDefined()
  })
})
