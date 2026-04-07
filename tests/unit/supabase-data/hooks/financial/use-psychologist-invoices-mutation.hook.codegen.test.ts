/**
 * Unit tests for usePsychologistInvoicesMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistInvoicesMutation } from "@workspace/supabase-data/hooks/financial/use-psychologist-invoices-mutation.hook.codegen"
import { financialQueryKeys } from "@workspace/supabase-data/hooks/financial/query-keys.codegen"

describe("usePsychologistInvoicesMutation", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistInvoicesMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(financialQueryKeys.psychologistInvoices()).toBeDefined()
  })
})
