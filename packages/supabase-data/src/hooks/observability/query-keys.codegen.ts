/**
 * TanStack Query key factory for domain "observability".
 * Import keys from this module only — avoid string literals in hooks/components.
 * 
 * @module @workspace/supabase-data/hooks/observability/query-keys.codegen
 * codegen:actions-hooks (generated) — do not hand-edit
 */
export const observabilityQueryKeys = {
  all: ["observability"] as const,
  observabilityEvents: () => [...observabilityQueryKeys.all, "observability-events"] as const,
  observabilityEventsList: (filters?: Record<string, unknown>) =>
    [...observabilityQueryKeys.observabilityEvents(), "list", filters ?? {}] as const,
}
