/**
 * usePsychologistServicesQuery — TanStack Query wrapper for a Server Action.
 * 
 * TODO: Wire the Server Action import and replace the queryFn body.
 * Do not add console.log — observability lives in the action (logServerEvent).
 * 
 * @module @workspace/supabase-data/hooks/preferences/use-psychologist-services-query.hook
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use client"

import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { preferencesQueryKeys } from "@workspace/supabase-data/hooks/preferences/query-keys.codegen"

// TODO: import { listPsychologistServicesAction } from "@workspace/supabase-data/actions/preferences/psychologist-services-list.codegen"
// TODO: Narrow the input type based on your action's requirements
type QueryFilters = Record<string, unknown>

export function usePsychologistServicesQuery(filters?: QueryFilters): UseQueryResult<unknown, Error> {
  return useQuery({
    queryKey: preferencesQueryKeys.psychologistServicesList(filters),
    queryFn: async () => {
      // TODO: Replace with actual action call
      // return listPsychologistServicesAction(filters ?? {})
      throw new Error("Wire Server Action in queryFn")
    },
  })
}
