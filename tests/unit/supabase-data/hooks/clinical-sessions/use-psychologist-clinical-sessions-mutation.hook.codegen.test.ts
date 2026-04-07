/**
 * Unit tests for usePsychologistClinicalSessionsMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistClinicalSessionsMutation } from "@workspace/supabase-data/hooks/clinical-sessions/use-psychologist-clinical-sessions-mutation.hook.codegen"
import { clinicalSessionsQueryKeys } from "@workspace/supabase-data/hooks/clinical-sessions/query-keys.codegen"

describe("usePsychologistClinicalSessionsMutation", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistClinicalSessionsMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(clinicalSessionsQueryKeys.psychologistClinicalSessions()).toBeDefined()
  })
})
