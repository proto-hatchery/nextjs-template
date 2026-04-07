/**
 * TanStack Query key factory for domain "catalog".
 * Import keys from this module only — avoid string literals in hooks/components.
 * 
 * @module @workspace/supabase-data/hooks/catalog/query-keys.codegen
 * codegen:actions-hooks (generated) — do not hand-edit
 */
export const catalogQueryKeys = {
  all: ["catalog"] as const,
  catalogClinicalActivities: () => [...catalogQueryKeys.all, "catalog-clinical-activities"] as const,
  catalogClinicalActivitiesList: (filters?: Record<string, unknown>) =>
    [...catalogQueryKeys.catalogClinicalActivities(), "list", filters ?? {}] as const,
  catalogDocumentTemplates: () => [...catalogQueryKeys.all, "catalog-document-templates"] as const,
  catalogDocumentTemplatesList: (filters?: Record<string, unknown>) =>
    [...catalogQueryKeys.catalogDocumentTemplates(), "list", filters ?? {}] as const,
  referenceValues: () => [...catalogQueryKeys.all, "reference-values"] as const,
  referenceValuesList: (filters?: Record<string, unknown>) =>
    [...catalogQueryKeys.referenceValues(), "list", filters ?? {}] as const,
  sessionTypes: () => [...catalogQueryKeys.all, "session-types"] as const,
  sessionTypesList: (filters?: Record<string, unknown>) =>
    [...catalogQueryKeys.sessionTypes(), "list", filters ?? {}] as const,
  subscriptionPlans: () => [...catalogQueryKeys.all, "subscription-plans"] as const,
  subscriptionPlansList: (filters?: Record<string, unknown>) =>
    [...catalogQueryKeys.subscriptionPlans(), "list", filters ?? {}] as const,
}
