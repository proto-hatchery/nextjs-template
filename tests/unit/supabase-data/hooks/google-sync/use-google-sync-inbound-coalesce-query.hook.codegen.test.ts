/**
 * Unit tests for useGoogleSyncInboundCoalesceQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useGoogleSyncInboundCoalesceQuery } from "@workspace/supabase-data/hooks/google-sync/use-google-sync-inbound-coalesce-query.hook.codegen"
import { googleSyncQueryKeys } from "@workspace/supabase-data/hooks/google-sync/query-keys.codegen"

describe("useGoogleSyncInboundCoalesceQuery", () => {
  it("should export the generated hook", () => {
    expect(useGoogleSyncInboundCoalesceQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(googleSyncQueryKeys.googleSyncInboundCoalesceList({})).toBeDefined()
  })
})
