/**
 * useCalendarEventSeriesQuery — TanStack Query wrapper for a Server Action.
 * 
 * TODO: Wire the Server Action import and replace the queryFn body.
 * Do not add console.log — observability lives in the action (logServerEvent).
 * 
 * @module @workspace/supabase-data/hooks/calendar/use-calendar-event-series-query.hook
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use client"

import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { calendarQueryKeys } from "@workspace/supabase-data/hooks/calendar/query-keys.codegen"

// TODO: import { listCalendarEventSeriesAction } from "@workspace/supabase-data/actions/calendar/calendar-event-series-list.codegen"
// TODO: Narrow the input type based on your action's requirements
type QueryFilters = Record<string, unknown>

export function useCalendarEventSeriesQuery(filters?: QueryFilters): UseQueryResult<unknown, Error> {
  return useQuery({
    queryKey: calendarQueryKeys.calendarEventSeriesList(filters),
    queryFn: async () => {
      // TODO: Replace with actual action call
      // return listCalendarEventSeriesAction(filters ?? {})
      throw new Error("Wire Server Action in queryFn")
    },
  })
}
