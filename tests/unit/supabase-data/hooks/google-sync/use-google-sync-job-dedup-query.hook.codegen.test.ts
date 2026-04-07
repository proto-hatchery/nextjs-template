/**
 * Unit tests for useGoogleSyncJobDedupQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useGoogleSyncJobDedupQuery } from "@workspace/supabase-data/hooks/google-sync/use-google-sync-job-dedup-query.hook.codegen"
import { googleSyncQueryKeys } from "@workspace/supabase-data/hooks/google-sync/query-keys.codegen"

describe("useGoogleSyncJobDedupQuery", () => {
  it("should export the generated hook", () => {
    expect(useGoogleSyncJobDedupQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(googleSyncQueryKeys.googleSyncJobDedupList({})).toBeDefined()
  })
})
