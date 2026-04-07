/**
 * usePsychologistNotesMutation — TanStack Query mutation wrapper for a Server Action.
 * 
 * TODO: Import the Server Action, narrow `_input`, and tune invalidation (prefer precise keys).
 * Do not add console.log — use structured logging in the action (logServerEvent).
 * 
 * @module @workspace/supabase-data/hooks/notes/use-psychologist-notes-mutation.hook
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use client"

import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query"

import { notesQueryKeys } from "@workspace/supabase-data/hooks/notes/query-keys.codegen"

// TODO: import { insertPsychologistNotesAction } from "@workspace/supabase-data/actions/notes/psychologist-notes-insert.codegen"
// TODO: Narrow the input type based on your action's requirements
type MutationInput = unknown

export function usePsychologistNotesMutation(): UseMutationResult<unknown, Error, MutationInput, unknown> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (_input: MutationInput) => {
      // TODO: Replace with actual action call
      // return insertPsychologistNotesAction(_input as any)
      throw new Error("Wire Server Action in mutationFn")
    },
    onSettled: async () => {
      // TODO: Invalidate precise query keys
      await queryClient.invalidateQueries({ queryKey: notesQueryKeys.psychologistNotes() })
    },
  })
}
