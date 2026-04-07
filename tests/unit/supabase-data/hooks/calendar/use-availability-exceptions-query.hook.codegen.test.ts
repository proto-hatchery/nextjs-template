/**
 * Unit tests for useAvailabilityExceptionsQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useAvailabilityExceptionsQuery } from "@workspace/supabase-data/hooks/calendar/use-availability-exceptions-query.hook.codegen"
import { calendarQueryKeys } from "@workspace/supabase-data/hooks/calendar/query-keys.codegen"

describe("useAvailabilityExceptionsQuery", () => {
  it("should export the generated hook", () => {
    expect(useAvailabilityExceptionsQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(calendarQueryKeys.availabilityExceptionsList({})).toBeDefined()
  })
})
