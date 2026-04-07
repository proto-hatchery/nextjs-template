/**
 * Unit tests for usePsychologistPatientAssessmentsMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistPatientAssessmentsMutation } from "@workspace/supabase-data/hooks/patients/use-psychologist-patient-assessments-mutation.hook.codegen"
import { patientsQueryKeys } from "@workspace/supabase-data/hooks/patients/query-keys.codegen"

describe("usePsychologistPatientAssessmentsMutation", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistPatientAssessmentsMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(patientsQueryKeys.psychologistPatientAssessments()).toBeDefined()
  })
})
