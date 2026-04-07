/**
 * Unit tests for usePsychologistPatientsQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistPatientsQuery } from "@workspace/supabase-data/hooks/patients/use-psychologist-patients-query.hook.codegen"
import { patientsQueryKeys } from "@workspace/supabase-data/hooks/patients/query-keys.codegen"

describe("usePsychologistPatientsQuery", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistPatientsQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(patientsQueryKeys.psychologistPatientsList({})).toBeDefined()
  })
})
