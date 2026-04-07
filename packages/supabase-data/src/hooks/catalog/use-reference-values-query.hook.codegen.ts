/**
 * useReferenceValuesQuery — TanStack Query wrapper for a Server Action.
 * 
 * TODO: Wire the Server Action import and replace the queryFn body.
 * Do not add console.log — observability lives in the action (logServerEvent).
 * 
 * @module @workspace/supabase-data/hooks/catalog/use-reference-values-query.hook
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use client"

import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { catalogQueryKeys } from "@workspace/supabase-data/hooks/catalog/query-keys.codegen"

// TODO: import { listReferenceValuesAction } from "@workspace/supabase-data/actions/catalog/reference-values-list.codegen"
// TODO: Narrow the input type based on your action's requirements
type QueryFilters = Record<string, unknown>

export function useReferenceValuesQuery(filters?: QueryFilters): UseQueryResult<unknown, Error> {
  return useQuery({
    queryKey: catalogQueryKeys.referenceValuesList(filters),
    queryFn: async () => {
      // TODO: Replace with actual action call
      // return listReferenceValuesAction(filters ?? {})
      throw new Error("Wire Server Action in queryFn")
    },
  })
}
