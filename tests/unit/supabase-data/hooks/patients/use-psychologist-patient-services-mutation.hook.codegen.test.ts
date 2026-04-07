/**
 * Unit tests for usePsychologistPatientServicesMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistPatientServicesMutation } from "@workspace/supabase-data/hooks/patients/use-psychologist-patient-services-mutation.hook.codegen"
import { patientsQueryKeys } from "@workspace/supabase-data/hooks/patients/query-keys.codegen"

describe("usePsychologistPatientServicesMutation", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistPatientServicesMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(patientsQueryKeys.psychologistPatientServices()).toBeDefined()
  })
})
