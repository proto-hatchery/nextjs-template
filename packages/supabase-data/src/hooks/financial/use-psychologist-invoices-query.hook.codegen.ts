/**
 * usePsychologistInvoicesQuery — TanStack Query wrapper for a Server Action.
 * 
 * TODO: Wire the Server Action import and replace the queryFn body.
 * Do not add console.log — observability lives in the action (logServerEvent).
 * 
 * @module @workspace/supabase-data/hooks/financial/use-psychologist-invoices-query.hook
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use client"

import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { financialQueryKeys } from "@workspace/supabase-data/hooks/financial/query-keys.codegen"

// TODO: import { listPsychologistInvoicesAction } from "@workspace/supabase-data/actions/financial/psychologist-invoices-list.codegen"
// TODO: Narrow the input type based on your action's requirements
type QueryFilters = Record<string, unknown>

export function usePsychologistInvoicesQuery(filters?: QueryFilters): UseQueryResult<unknown, Error> {
  return useQuery({
    queryKey: financialQueryKeys.psychologistInvoicesList(filters),
    queryFn: async () => {
      // TODO: Replace with actual action call
      // return listPsychologistInvoicesAction(filters ?? {})
      throw new Error("Wire Server Action in queryFn")
    },
  })
}
