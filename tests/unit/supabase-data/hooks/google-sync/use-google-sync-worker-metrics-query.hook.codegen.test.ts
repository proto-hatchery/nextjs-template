/**
 * Unit tests for useGoogleSyncWorkerMetricsQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useGoogleSyncWorkerMetricsQuery } from "@workspace/supabase-data/hooks/google-sync/use-google-sync-worker-metrics-query.hook.codegen"
import { googleSyncQueryKeys } from "@workspace/supabase-data/hooks/google-sync/query-keys.codegen"

describe("useGoogleSyncWorkerMetricsQuery", () => {
  it("should export the generated hook", () => {
    expect(useGoogleSyncWorkerMetricsQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(googleSyncQueryKeys.googleSyncWorkerMetricsList({})).toBeDefined()
  })
})
