/**
 * TanStack Query key factory for domain "audit".
 * Import keys from this module only — avoid string literals in hooks/components.
 * 
 * @module @workspace/supabase-data/hooks/audit/query-keys.codegen
 * codegen:actions-hooks (generated) — do not hand-edit
 */
export const auditQueryKeys = {
  all: ["audit"] as const,
  auditLogs: () => [...auditQueryKeys.all, "audit-logs"] as const,
  auditLogsList: (filters?: Record<string, unknown>) =>
    [...auditQueryKeys.auditLogs(), "list", filters ?? {}] as const,
  encryptionAuditLog: () => [...auditQueryKeys.all, "encryption-audit-log"] as const,
  encryptionAuditLogList: (filters?: Record<string, unknown>) =>
    [...auditQueryKeys.encryptionAuditLog(), "list", filters ?? {}] as const,
  patientDeletionAuditLog: () => [...auditQueryKeys.all, "patient-deletion-audit-log"] as const,
  patientDeletionAuditLogList: (filters?: Record<string, unknown>) =>
    [...auditQueryKeys.patientDeletionAuditLog(), "list", filters ?? {}] as const,
  psychologistPreferencesAuditLog: () => [...auditQueryKeys.all, "psychologist-preferences-audit-log"] as const,
  psychologistPreferencesAuditLogList: (filters?: Record<string, unknown>) =>
    [...auditQueryKeys.psychologistPreferencesAuditLog(), "list", filters ?? {}] as const,
}
