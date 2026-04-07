/**
 * useGoogleSyncWorkerMetricsQuery — TanStack Query wrapper for a Server Action.
 * 
 * TODO: Wire the Server Action import and replace the queryFn body.
 * Do not add console.log — observability lives in the action (logServerEvent).
 * 
 * @module @workspace/supabase-data/hooks/google-sync/use-google-sync-worker-metrics-query.hook
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use client"

import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { googleSyncQueryKeys } from "@workspace/supabase-data/hooks/google-sync/query-keys.codegen"

// TODO: import { listGoogleSyncWorkerMetricsAction } from "@workspace/supabase-data/actions/google-sync/google-sync-worker-metrics-list.codegen"
// TODO: Narrow the input type based on your action's requirements
type QueryFilters = Record<string, unknown>

export function useGoogleSyncWorkerMetricsQuery(filters?: QueryFilters): UseQueryResult<unknown, Error> {
  return useQuery({
    queryKey: googleSyncQueryKeys.googleSyncWorkerMetricsList(filters),
    queryFn: async () => {
      // TODO: Replace with actual action call
      // return listGoogleSyncWorkerMetricsAction(filters ?? {})
      throw new Error("Wire Server Action in queryFn")
    },
  })
}
