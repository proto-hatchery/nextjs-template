/**
 * Unit tests for useClinicalSessionDetailsQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useClinicalSessionDetailsQuery } from "@workspace/supabase-data/hooks/clinical-sessions/use-clinical-session-details-query.hook.codegen"
import { clinicalSessionsQueryKeys } from "@workspace/supabase-data/hooks/clinical-sessions/query-keys.codegen"

describe("useClinicalSessionDetailsQuery", () => {
  it("should export the generated hook", () => {
    expect(useClinicalSessionDetailsQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(clinicalSessionsQueryKeys.clinicalSessionDetailsList({})).toBeDefined()
  })
})
