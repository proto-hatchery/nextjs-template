/**
 * Unit tests for useGoogleSyncWorkerMetricsMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useGoogleSyncWorkerMetricsMutation } from "@workspace/supabase-data/hooks/google-sync/use-google-sync-worker-metrics-mutation.hook.codegen"
import { googleSyncQueryKeys } from "@workspace/supabase-data/hooks/google-sync/query-keys.codegen"

describe("useGoogleSyncWorkerMetricsMutation", () => {
  it("should export the generated hook", () => {
    expect(useGoogleSyncWorkerMetricsMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(googleSyncQueryKeys.googleSyncWorkerMetrics()).toBeDefined()
  })
})
