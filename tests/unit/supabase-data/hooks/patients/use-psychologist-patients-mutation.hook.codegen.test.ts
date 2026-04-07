/**
 * Unit tests for usePsychologistPatientsMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistPatientsMutation } from "@workspace/supabase-data/hooks/patients/use-psychologist-patients-mutation.hook.codegen"
import { patientsQueryKeys } from "@workspace/supabase-data/hooks/patients/query-keys.codegen"

describe("usePsychologistPatientsMutation", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistPatientsMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(patientsQueryKeys.psychologistPatients()).toBeDefined()
  })
})
