/**
 * usePsychologistFinancialEntriesQuery — TanStack Query wrapper for a Server Action.
 * 
 * TODO: Wire the Server Action import and replace the queryFn body.
 * Do not add console.log — observability lives in the action (logServerEvent).
 * 
 * @module @workspace/supabase-data/hooks/financial/use-psychologist-financial-entries-query.hook
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use client"

import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { financialQueryKeys } from "@workspace/supabase-data/hooks/financial/query-keys.codegen"

// TODO: import { listPsychologistFinancialEntriesAction } from "@workspace/supabase-data/actions/financial/psychologist-financial-entries-list.codegen"
// TODO: Narrow the input type based on your action's requirements
type QueryFilters = Record<string, unknown>

export function usePsychologistFinancialEntriesQuery(filters?: QueryFilters): UseQueryResult<unknown, Error> {
  return useQuery({
    queryKey: financialQueryKeys.psychologistFinancialEntriesList(filters),
    queryFn: async () => {
      // TODO: Replace with actual action call
      // return listPsychologistFinancialEntriesAction(filters ?? {})
      throw new Error("Wire Server Action in queryFn")
    },
  })
}
