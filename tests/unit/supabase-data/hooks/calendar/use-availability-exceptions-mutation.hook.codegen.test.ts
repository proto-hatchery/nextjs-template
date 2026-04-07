/**
 * Unit tests for useAvailabilityExceptionsMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useAvailabilityExceptionsMutation } from "@workspace/supabase-data/hooks/calendar/use-availability-exceptions-mutation.hook.codegen"
import { calendarQueryKeys } from "@workspace/supabase-data/hooks/calendar/query-keys.codegen"

describe("useAvailabilityExceptionsMutation", () => {
  it("should export the generated hook", () => {
    expect(useAvailabilityExceptionsMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(calendarQueryKeys.availabilityExceptions()).toBeDefined()
  })
})
