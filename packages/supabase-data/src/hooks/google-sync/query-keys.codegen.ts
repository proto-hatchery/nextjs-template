/**
 * TanStack Query key factory for domain "google-sync".
 * Import keys from this module only — avoid string literals in hooks/components.
 * 
 * @module @workspace/supabase-data/hooks/google-sync/query-keys.codegen
 * codegen:actions-hooks (generated) — do not hand-edit
 */
export const googleSyncQueryKeys = {
  all: ["google-sync"] as const,
  googleCalendarConnections: () => [...googleSyncQueryKeys.all, "google-calendar-connections"] as const,
  googleCalendarConnectionsList: (filters?: Record<string, unknown>) =>
    [...googleSyncQueryKeys.googleCalendarConnections(), "list", filters ?? {}] as const,
  googleSyncIdempotency: () => [...googleSyncQueryKeys.all, "google-sync-idempotency"] as const,
  googleSyncIdempotencyList: (filters?: Record<string, unknown>) =>
    [...googleSyncQueryKeys.googleSyncIdempotency(), "list", filters ?? {}] as const,
  googleSyncInboundCoalesce: () => [...googleSyncQueryKeys.all, "google-sync-inbound-coalesce"] as const,
  googleSyncInboundCoalesceList: (filters?: Record<string, unknown>) =>
    [...googleSyncQueryKeys.googleSyncInboundCoalesce(), "list", filters ?? {}] as const,
  googleSyncJobDedup: () => [...googleSyncQueryKeys.all, "google-sync-job-dedup"] as const,
  googleSyncJobDedupList: (filters?: Record<string, unknown>) =>
    [...googleSyncQueryKeys.googleSyncJobDedup(), "list", filters ?? {}] as const,
  googleSyncLogs: () => [...googleSyncQueryKeys.all, "google-sync-logs"] as const,
  googleSyncLogsList: (filters?: Record<string, unknown>) =>
    [...googleSyncQueryKeys.googleSyncLogs(), "list", filters ?? {}] as const,
  googleSyncWorkerMetrics: () => [...googleSyncQueryKeys.all, "google-sync-worker-metrics"] as const,
  googleSyncWorkerMetricsList: (filters?: Record<string, unknown>) =>
    [...googleSyncQueryKeys.googleSyncWorkerMetrics(), "list", filters ?? {}] as const,
}
