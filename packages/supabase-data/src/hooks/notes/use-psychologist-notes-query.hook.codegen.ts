/**
 * usePsychologistNotesQuery — TanStack Query wrapper for a Server Action.
 * 
 * TODO: Wire the Server Action import and replace the queryFn body.
 * Do not add console.log — observability lives in the action (logServerEvent).
 * 
 * @module @workspace/supabase-data/hooks/notes/use-psychologist-notes-query.hook
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use client"

import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { notesQueryKeys } from "@workspace/supabase-data/hooks/notes/query-keys.codegen"

// TODO: import { listPsychologistNotesAction } from "@workspace/supabase-data/actions/notes/psychologist-notes-list.codegen"
// TODO: Narrow the input type based on your action's requirements
type QueryFilters = Record<string, unknown>

export function usePsychologistNotesQuery(filters?: QueryFilters): UseQueryResult<unknown, Error> {
  return useQuery({
    queryKey: notesQueryKeys.psychologistNotesList(filters),
    queryFn: async () => {
      // TODO: Replace with actual action call
      // return listPsychologistNotesAction(filters ?? {})
      throw new Error("Wire Server Action in queryFn")
    },
  })
}
