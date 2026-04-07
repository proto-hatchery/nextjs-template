/**
 * Unit tests for usePsychologistPatientMedicalItemsQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistPatientMedicalItemsQuery } from "@workspace/supabase-data/hooks/patients/use-psychologist-patient-medical-items-query.hook.codegen"
import { patientsQueryKeys } from "@workspace/supabase-data/hooks/patients/query-keys.codegen"

describe("usePsychologistPatientMedicalItemsQuery", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistPatientMedicalItemsQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(patientsQueryKeys.psychologistPatientMedicalItemsList({})).toBeDefined()
  })
})
