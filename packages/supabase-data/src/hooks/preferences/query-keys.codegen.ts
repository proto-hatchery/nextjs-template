/**
 * TanStack Query key factory for domain "preferences".
 * Import keys from this module only — avoid string literals in hooks/components.
 * 
 * @module @workspace/supabase-data/hooks/preferences/query-keys.codegen
 * codegen:actions-hooks (generated) — do not hand-edit
 */
export const preferencesQueryKeys = {
  all: ["preferences"] as const,
  psychologistPreferences: () => [...preferencesQueryKeys.all, "psychologist-preferences"] as const,
  psychologistPreferencesList: (filters?: Record<string, unknown>) =>
    [...preferencesQueryKeys.psychologistPreferences(), "list", filters ?? {}] as const,
  psychologistServices: () => [...preferencesQueryKeys.all, "psychologist-services"] as const,
  psychologistServicesList: (filters?: Record<string, unknown>) =>
    [...preferencesQueryKeys.psychologistServices(), "list", filters ?? {}] as const,
}
