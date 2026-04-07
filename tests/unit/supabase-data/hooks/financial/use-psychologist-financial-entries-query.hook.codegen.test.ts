/**
 * Unit tests for usePsychologistFinancialEntriesQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistFinancialEntriesQuery } from "@workspace/supabase-data/hooks/financial/use-psychologist-financial-entries-query.hook.codegen"
import { financialQueryKeys } from "@workspace/supabase-data/hooks/financial/query-keys.codegen"

describe("usePsychologistFinancialEntriesQuery", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistFinancialEntriesQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(financialQueryKeys.psychologistFinancialEntriesList({})).toBeDefined()
  })
})
