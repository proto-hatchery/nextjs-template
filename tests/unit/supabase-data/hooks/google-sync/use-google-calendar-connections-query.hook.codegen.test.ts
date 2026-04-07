/**
 * Unit tests for useGoogleCalendarConnectionsQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useGoogleCalendarConnectionsQuery } from "@workspace/supabase-data/hooks/google-sync/use-google-calendar-connections-query.hook.codegen"
import { googleSyncQueryKeys } from "@workspace/supabase-data/hooks/google-sync/query-keys.codegen"

describe("useGoogleCalendarConnectionsQuery", () => {
  it("should export the generated hook", () => {
    expect(useGoogleCalendarConnectionsQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(googleSyncQueryKeys.googleCalendarConnectionsList({})).toBeDefined()
  })
})
