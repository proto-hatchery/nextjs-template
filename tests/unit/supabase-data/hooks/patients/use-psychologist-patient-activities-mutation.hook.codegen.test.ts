/**
 * Unit tests for usePsychologistPatientActivitiesMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistPatientActivitiesMutation } from "@workspace/supabase-data/hooks/patients/use-psychologist-patient-activities-mutation.hook.codegen"
import { patientsQueryKeys } from "@workspace/supabase-data/hooks/patients/query-keys.codegen"

describe("usePsychologistPatientActivitiesMutation", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistPatientActivitiesMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(patientsQueryKeys.psychologistPatientActivities()).toBeDefined()
  })
})
