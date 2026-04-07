/**
 * Unit tests for useCalendarChangeLogQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useCalendarChangeLogQuery } from "@workspace/supabase-data/hooks/calendar/use-calendar-change-log-query.hook.codegen"
import { calendarQueryKeys } from "@workspace/supabase-data/hooks/calendar/query-keys.codegen"

describe("useCalendarChangeLogQuery", () => {
  it("should export the generated hook", () => {
    expect(useCalendarChangeLogQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(calendarQueryKeys.calendarChangeLogList({})).toBeDefined()
  })
})
