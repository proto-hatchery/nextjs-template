/**
 * Unit tests for usePsychologistPatientGuardiansMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistPatientGuardiansMutation } from "@workspace/supabase-data/hooks/patients/use-psychologist-patient-guardians-mutation.hook.codegen"
import { patientsQueryKeys } from "@workspace/supabase-data/hooks/patients/query-keys.codegen"

describe("usePsychologistPatientGuardiansMutation", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistPatientGuardiansMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(patientsQueryKeys.psychologistPatientGuardians()).toBeDefined()
  })
})
