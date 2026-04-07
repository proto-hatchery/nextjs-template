/**
 * TanStack Query key factory for domain "documents".
 * Import keys from this module only — avoid string literals in hooks/components.
 * 
 * @module @workspace/supabase-data/hooks/documents/query-keys.codegen
 * codegen:actions-hooks (generated) — do not hand-edit
 */
export const documentsQueryKeys = {
  all: ["documents"] as const,
  generatedDocuments: () => [...documentsQueryKeys.all, "generated-documents"] as const,
  generatedDocumentsList: (filters?: Record<string, unknown>) =>
    [...documentsQueryKeys.generatedDocuments(), "list", filters ?? {}] as const,
  psychologistPatientGuardianDocuments: () => [...documentsQueryKeys.all, "psychologist-patient-guardian-documents"] as const,
  psychologistPatientGuardianDocumentsList: (filters?: Record<string, unknown>) =>
    [...documentsQueryKeys.psychologistPatientGuardianDocuments(), "list", filters ?? {}] as const,
}
