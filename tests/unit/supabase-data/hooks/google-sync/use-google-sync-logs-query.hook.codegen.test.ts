/**
 * Unit tests for useGoogleSyncLogsQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useGoogleSyncLogsQuery } from "@workspace/supabase-data/hooks/google-sync/use-google-sync-logs-query.hook.codegen"
import { googleSyncQueryKeys } from "@workspace/supabase-data/hooks/google-sync/query-keys.codegen"

describe("useGoogleSyncLogsQuery", () => {
  it("should export the generated hook", () => {
    expect(useGoogleSyncLogsQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(googleSyncQueryKeys.googleSyncLogsList({})).toBeDefined()
  })
})
