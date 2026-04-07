/**
 * Unit tests for usePsychologistInvoicesQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistInvoicesQuery } from "@workspace/supabase-data/hooks/financial/use-psychologist-invoices-query.hook.codegen"
import { financialQueryKeys } from "@workspace/supabase-data/hooks/financial/query-keys.codegen"

describe("usePsychologistInvoicesQuery", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistInvoicesQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(financialQueryKeys.psychologistInvoicesList({})).toBeDefined()
  })
})
