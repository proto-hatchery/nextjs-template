/**
 * TanStack Query key factory for domain "onboarding".
 * Import keys from this module only — avoid string literals in hooks/components.
 * 
 * @module @workspace/supabase-data/hooks/onboarding/query-keys.codegen
 * codegen:actions-hooks (generated) — do not hand-edit
 */
export const onboardingQueryKeys = {
  all: ["onboarding"] as const,
  psychologistOnboardingState: () => [...onboardingQueryKeys.all, "psychologist-onboarding-state"] as const,
  psychologistOnboardingStateList: (filters?: Record<string, unknown>) =>
    [...onboardingQueryKeys.psychologistOnboardingState(), "list", filters ?? {}] as const,
}
