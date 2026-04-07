/**
 * usePsychologistAssistantsQuery — TanStack Query wrapper for a Server Action.
 * 
 * TODO: Wire the Server Action import and replace the queryFn body.
 * Do not add console.log — observability lives in the action (logServerEvent).
 * 
 * @module @workspace/supabase-data/hooks/assistants/use-psychologist-assistants-query.hook
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use client"

import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { assistantsQueryKeys } from "@workspace/supabase-data/hooks/assistants/query-keys.codegen"

// TODO: import { listPsychologistAssistantsAction } from "@workspace/supabase-data/actions/assistants/psychologist-assistants-list.codegen"
// TODO: Narrow the input type based on your action's requirements
type QueryFilters = Record<string, unknown>

export function usePsychologistAssistantsQuery(filters?: QueryFilters): UseQueryResult<unknown, Error> {
  return useQuery({
    queryKey: assistantsQueryKeys.psychologistAssistantsList(filters),
    queryFn: async () => {
      // TODO: Replace with actual action call
      // return listPsychologistAssistantsAction(filters ?? {})
      throw new Error("Wire Server Action in queryFn")
    },
  })
}
