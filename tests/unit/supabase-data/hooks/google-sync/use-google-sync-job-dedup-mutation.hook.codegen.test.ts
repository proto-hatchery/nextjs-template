/**
 * Unit tests for useGoogleSyncJobDedupMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useGoogleSyncJobDedupMutation } from "@workspace/supabase-data/hooks/google-sync/use-google-sync-job-dedup-mutation.hook.codegen"
import { googleSyncQueryKeys } from "@workspace/supabase-data/hooks/google-sync/query-keys.codegen"

describe("useGoogleSyncJobDedupMutation", () => {
  it("should export the generated hook", () => {
    expect(useGoogleSyncJobDedupMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(googleSyncQueryKeys.googleSyncJobDedup()).toBeDefined()
  })
})
