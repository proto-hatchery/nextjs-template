/**
 * Unit tests for usePsychologistPatientChargesQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistPatientChargesQuery } from "@workspace/supabase-data/hooks/financial/use-psychologist-patient-charges-query.hook.codegen"
import { financialQueryKeys } from "@workspace/supabase-data/hooks/financial/query-keys.codegen"

describe("usePsychologistPatientChargesQuery", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistPatientChargesQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(financialQueryKeys.psychologistPatientChargesList({})).toBeDefined()
  })
})
