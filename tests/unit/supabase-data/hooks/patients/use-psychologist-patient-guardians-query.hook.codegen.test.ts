/**
 * Unit tests for usePsychologistPatientGuardiansQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistPatientGuardiansQuery } from "@workspace/supabase-data/hooks/patients/use-psychologist-patient-guardians-query.hook.codegen"
import { patientsQueryKeys } from "@workspace/supabase-data/hooks/patients/query-keys.codegen"

describe("usePsychologistPatientGuardiansQuery", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistPatientGuardiansQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(patientsQueryKeys.psychologistPatientGuardiansList({})).toBeDefined()
  })
})
