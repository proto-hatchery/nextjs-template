/**
 * Unit tests for usePsychologistPreferencesQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistPreferencesQuery } from "@workspace/supabase-data/hooks/preferences/use-psychologist-preferences-query.hook.codegen"
import { preferencesQueryKeys } from "@workspace/supabase-data/hooks/preferences/query-keys.codegen"

describe("usePsychologistPreferencesQuery", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistPreferencesQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(preferencesQueryKeys.psychologistPreferencesList({})).toBeDefined()
  })
})
