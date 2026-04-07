/**
 * Unit tests for useReferenceValuesQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useReferenceValuesQuery } from "@workspace/supabase-data/hooks/catalog/use-reference-values-query.hook.codegen"
import { catalogQueryKeys } from "@workspace/supabase-data/hooks/catalog/query-keys.codegen"

describe("useReferenceValuesQuery", () => {
  it("should export the generated hook", () => {
    expect(useReferenceValuesQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(catalogQueryKeys.referenceValuesList({})).toBeDefined()
  })
})
