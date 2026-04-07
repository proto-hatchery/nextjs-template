/**
 * TanStack Query key factory for domain "account-management".
 * Import keys from this module only — avoid string literals in hooks/components.
 * 
 * @module @workspace/supabase-data/hooks/account-management/query-keys.codegen
 * codegen:actions-hooks (generated) — do not hand-edit
 */
export const accountManagementQueryKeys = {
  all: ["account-management"] as const,
  accountDeletionRequests: () => [...accountManagementQueryKeys.all, "account-deletion-requests"] as const,
  accountDeletionRequestsList: (filters?: Record<string, unknown>) =>
    [...accountManagementQueryKeys.accountDeletionRequests(), "list", filters ?? {}] as const,
}
