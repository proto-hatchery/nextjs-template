/**
 * Unit tests for usePsychologistPreferencesMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistPreferencesMutation } from "@workspace/supabase-data/hooks/preferences/use-psychologist-preferences-mutation.hook.codegen"
import { preferencesQueryKeys } from "@workspace/supabase-data/hooks/preferences/query-keys.codegen"

describe("usePsychologistPreferencesMutation", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistPreferencesMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(preferencesQueryKeys.psychologistPreferences()).toBeDefined()
  })
})
