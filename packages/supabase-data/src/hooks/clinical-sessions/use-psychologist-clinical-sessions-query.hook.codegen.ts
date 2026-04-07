/**
 * usePsychologistClinicalSessionsQuery — TanStack Query wrapper for a Server Action.
 * 
 * TODO: Wire the Server Action import and replace the queryFn body.
 * Do not add console.log — observability lives in the action (logServerEvent).
 * 
 * @module @workspace/supabase-data/hooks/clinical-sessions/use-psychologist-clinical-sessions-query.hook
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use client"

import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { clinicalSessionsQueryKeys } from "@workspace/supabase-data/hooks/clinical-sessions/query-keys.codegen"

// TODO: import { listPsychologistClinicalSessionsAction } from "@workspace/supabase-data/actions/clinical-sessions/psychologist-clinical-sessions-list.codegen"
// TODO: Narrow the input type based on your action's requirements
type QueryFilters = Record<string, unknown>

export function usePsychologistClinicalSessionsQuery(filters?: QueryFilters): UseQueryResult<unknown, Error> {
  return useQuery({
    queryKey: clinicalSessionsQueryKeys.psychologistClinicalSessionsList(filters),
    queryFn: async () => {
      // TODO: Replace with actual action call
      // return listPsychologistClinicalSessionsAction(filters ?? {})
      throw new Error("Wire Server Action in queryFn")
    },
  })
}
