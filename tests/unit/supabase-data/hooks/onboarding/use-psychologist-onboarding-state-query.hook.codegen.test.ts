/**
 * Unit tests for usePsychologistOnboardingStateQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistOnboardingStateQuery } from "@workspace/supabase-data/hooks/onboarding/use-psychologist-onboarding-state-query.hook.codegen"
import { onboardingQueryKeys } from "@workspace/supabase-data/hooks/onboarding/query-keys.codegen"

describe("usePsychologistOnboardingStateQuery", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistOnboardingStateQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(onboardingQueryKeys.psychologistOnboardingStateList({})).toBeDefined()
  })
})
