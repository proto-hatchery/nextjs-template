/**
 * TanStack Query key factory for domain "clinical-sessions".
 * Import keys from this module only — avoid string literals in hooks/components.
 * 
 * @module @workspace/supabase-data/hooks/clinical-sessions/query-keys.codegen
 * codegen:actions-hooks (generated) — do not hand-edit
 */
export const clinicalSessionsQueryKeys = {
  all: ["clinical-sessions"] as const,
  clinicalSessionDetails: () => [...clinicalSessionsQueryKeys.all, "clinical-session-details"] as const,
  clinicalSessionDetailsList: (filters?: Record<string, unknown>) =>
    [...clinicalSessionsQueryKeys.clinicalSessionDetails(), "list", filters ?? {}] as const,
  psychologistClinicalSessions: () => [...clinicalSessionsQueryKeys.all, "psychologist-clinical-sessions"] as const,
  psychologistClinicalSessionsList: (filters?: Record<string, unknown>) =>
    [...clinicalSessionsQueryKeys.psychologistClinicalSessions(), "list", filters ?? {}] as const,
}
