/**
 * Unit tests for useSessionTypesQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useSessionTypesQuery } from "@workspace/supabase-data/hooks/catalog/use-session-types-query.hook.codegen"
import { catalogQueryKeys } from "@workspace/supabase-data/hooks/catalog/query-keys.codegen"

describe("useSessionTypesQuery", () => {
  it("should export the generated hook", () => {
    expect(useSessionTypesQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(catalogQueryKeys.sessionTypesList({})).toBeDefined()
  })
})
