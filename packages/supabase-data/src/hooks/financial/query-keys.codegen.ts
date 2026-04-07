/**
 * TanStack Query key factory for domain "financial".
 * Import keys from this module only — avoid string literals in hooks/components.
 * 
 * @module @workspace/supabase-data/hooks/financial/query-keys.codegen
 * codegen:actions-hooks (generated) — do not hand-edit
 */
export const financialQueryKeys = {
  all: ["financial"] as const,
  psychologistFinancialEntries: () => [...financialQueryKeys.all, "psychologist-financial-entries"] as const,
  psychologistFinancialEntriesList: (filters?: Record<string, unknown>) =>
    [...financialQueryKeys.psychologistFinancialEntries(), "list", filters ?? {}] as const,
  psychologistInvoices: () => [...financialQueryKeys.all, "psychologist-invoices"] as const,
  psychologistInvoicesList: (filters?: Record<string, unknown>) =>
    [...financialQueryKeys.psychologistInvoices(), "list", filters ?? {}] as const,
  psychologistPatientCharges: () => [...financialQueryKeys.all, "psychologist-patient-charges"] as const,
  psychologistPatientChargesList: (filters?: Record<string, unknown>) =>
    [...financialQueryKeys.psychologistPatientCharges(), "list", filters ?? {}] as const,
}
