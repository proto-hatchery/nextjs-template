/**
 * Unit tests for useGoogleSyncLogsMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useGoogleSyncLogsMutation } from "@workspace/supabase-data/hooks/google-sync/use-google-sync-logs-mutation.hook.codegen"
import { googleSyncQueryKeys } from "@workspace/supabase-data/hooks/google-sync/query-keys.codegen"

describe("useGoogleSyncLogsMutation", () => {
  it("should export the generated hook", () => {
    expect(useGoogleSyncLogsMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(googleSyncQueryKeys.googleSyncLogs()).toBeDefined()
  })
})
