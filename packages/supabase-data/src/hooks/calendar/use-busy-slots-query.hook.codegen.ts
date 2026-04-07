/**
 * useBusySlotsQuery — TanStack Query wrapper for a Server Action.
 * 
 * TODO: Wire the Server Action import and replace the queryFn body.
 * Do not add console.log — observability lives in the action (logServerEvent).
 * 
 * @module @workspace/supabase-data/hooks/calendar/use-busy-slots-query.hook
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use client"

import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { calendarQueryKeys } from "@workspace/supabase-data/hooks/calendar/query-keys.codegen"

// TODO: import { listBusySlotsAction } from "@workspace/supabase-data/actions/calendar/busy-slots-list.codegen"
// TODO: Narrow the input type based on your action's requirements
type QueryFilters = Record<string, unknown>

export function useBusySlotsQuery(filters?: QueryFilters): UseQueryResult<unknown, Error> {
  return useQuery({
    queryKey: calendarQueryKeys.busySlotsList(filters),
    queryFn: async () => {
      // TODO: Replace with actual action call
      // return listBusySlotsAction(filters ?? {})
      throw new Error("Wire Server Action in queryFn")
    },
  })
}
