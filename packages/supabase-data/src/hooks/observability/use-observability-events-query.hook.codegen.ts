/**
 * useObservabilityEventsQuery — TanStack Query wrapper for a Server Action.
 * 
 * TODO: Wire the Server Action import and replace the queryFn body.
 * Do not add console.log — observability lives in the action (logServerEvent).
 * 
 * @module @workspace/supabase-data/hooks/observability/use-observability-events-query.hook
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use client"

import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { observabilityQueryKeys } from "@workspace/supabase-data/hooks/observability/query-keys.codegen"

// TODO: import { listObservabilityEventsAction } from "@workspace/supabase-data/actions/observability/observability-events-list.codegen"
// TODO: Narrow the input type based on your action's requirements
type QueryFilters = Record<string, unknown>

export function useObservabilityEventsQuery(filters?: QueryFilters): UseQueryResult<unknown, Error> {
  return useQuery({
    queryKey: observabilityQueryKeys.observabilityEventsList(filters),
    queryFn: async () => {
      // TODO: Replace with actual action call
      // return listObservabilityEventsAction(filters ?? {})
      throw new Error("Wire Server Action in queryFn")
    },
  })
}
