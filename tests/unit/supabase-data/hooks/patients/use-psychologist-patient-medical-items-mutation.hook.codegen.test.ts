/**
 * Unit tests for usePsychologistPatientMedicalItemsMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistPatientMedicalItemsMutation } from "@workspace/supabase-data/hooks/patients/use-psychologist-patient-medical-items-mutation.hook.codegen"
import { patientsQueryKeys } from "@workspace/supabase-data/hooks/patients/query-keys.codegen"

describe("usePsychologistPatientMedicalItemsMutation", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistPatientMedicalItemsMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(patientsQueryKeys.psychologistPatientMedicalItems()).toBeDefined()
  })
})
