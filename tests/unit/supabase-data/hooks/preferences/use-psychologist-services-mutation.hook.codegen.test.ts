/**
 * Unit tests for usePsychologistServicesMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistServicesMutation } from "@workspace/supabase-data/hooks/preferences/use-psychologist-services-mutation.hook.codegen"
import { preferencesQueryKeys } from "@workspace/supabase-data/hooks/preferences/query-keys.codegen"

describe("usePsychologistServicesMutation", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistServicesMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(preferencesQueryKeys.psychologistServices()).toBeDefined()
  })
})
