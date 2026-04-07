/**
 * Unit tests for useClinicalSessionDetailsMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useClinicalSessionDetailsMutation } from "@workspace/supabase-data/hooks/clinical-sessions/use-clinical-session-details-mutation.hook.codegen"
import { clinicalSessionsQueryKeys } from "@workspace/supabase-data/hooks/clinical-sessions/query-keys.codegen"

describe("useClinicalSessionDetailsMutation", () => {
  it("should export the generated hook", () => {
    expect(useClinicalSessionDetailsMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(clinicalSessionsQueryKeys.clinicalSessionDetails()).toBeDefined()
  })
})
