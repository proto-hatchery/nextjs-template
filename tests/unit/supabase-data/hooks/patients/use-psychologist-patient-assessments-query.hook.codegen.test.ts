/**
 * Unit tests for usePsychologistPatientAssessmentsQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistPatientAssessmentsQuery } from "@workspace/supabase-data/hooks/patients/use-psychologist-patient-assessments-query.hook.codegen"
import { patientsQueryKeys } from "@workspace/supabase-data/hooks/patients/query-keys.codegen"

describe("usePsychologistPatientAssessmentsQuery", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistPatientAssessmentsQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(patientsQueryKeys.psychologistPatientAssessmentsList({})).toBeDefined()
  })
})
