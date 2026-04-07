/**
 * Unit tests for usePsychologistClinicalSessionsQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistClinicalSessionsQuery } from "@workspace/supabase-data/hooks/clinical-sessions/use-psychologist-clinical-sessions-query.hook.codegen"
import { clinicalSessionsQueryKeys } from "@workspace/supabase-data/hooks/clinical-sessions/query-keys.codegen"

describe("usePsychologistClinicalSessionsQuery", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistClinicalSessionsQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(clinicalSessionsQueryKeys.psychologistClinicalSessionsList({})).toBeDefined()
  })
})
