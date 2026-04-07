/**
 * Unit tests for usePsychologistPatientActivitiesQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistPatientActivitiesQuery } from "@workspace/supabase-data/hooks/patients/use-psychologist-patient-activities-query.hook.codegen"
import { patientsQueryKeys } from "@workspace/supabase-data/hooks/patients/query-keys.codegen"

describe("usePsychologistPatientActivitiesQuery", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistPatientActivitiesQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(patientsQueryKeys.psychologistPatientActivitiesList({})).toBeDefined()
  })
})
