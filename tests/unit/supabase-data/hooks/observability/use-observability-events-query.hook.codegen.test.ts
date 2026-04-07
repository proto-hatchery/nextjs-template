/**
 * Unit tests for useObservabilityEventsQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useObservabilityEventsQuery } from "@workspace/supabase-data/hooks/observability/use-observability-events-query.hook.codegen"
import { observabilityQueryKeys } from "@workspace/supabase-data/hooks/observability/query-keys.codegen"

describe("useObservabilityEventsQuery", () => {
  it("should export the generated hook", () => {
    expect(useObservabilityEventsQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(observabilityQueryKeys.observabilityEventsList({})).toBeDefined()
  })
})
