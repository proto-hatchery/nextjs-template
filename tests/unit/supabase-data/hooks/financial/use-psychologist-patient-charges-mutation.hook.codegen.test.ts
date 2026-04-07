/**
 * Unit tests for usePsychologistPatientChargesMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistPatientChargesMutation } from "@workspace/supabase-data/hooks/financial/use-psychologist-patient-charges-mutation.hook.codegen"
import { financialQueryKeys } from "@workspace/supabase-data/hooks/financial/query-keys.codegen"

describe("usePsychologistPatientChargesMutation", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistPatientChargesMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(financialQueryKeys.psychologistPatientCharges()).toBeDefined()
  })
})
