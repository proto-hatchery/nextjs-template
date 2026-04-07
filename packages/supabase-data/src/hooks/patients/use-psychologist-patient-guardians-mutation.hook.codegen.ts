/**
 * usePsychologistPatientGuardiansMutation — TanStack Query mutation wrapper for a Server Action.
 * 
 * TODO: Import the Server Action, narrow `_input`, and tune invalidation (prefer precise keys).
 * Do not add console.log — use structured logging in the action (logServerEvent).
 * 
 * @module @workspace/supabase-data/hooks/patients/use-psychologist-patient-guardians-mutation.hook
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use client"

import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query"

import { patientsQueryKeys } from "@workspace/supabase-data/hooks/patients/query-keys.codegen"

// TODO: import { insertPsychologistPatientGuardiansAction } from "@workspace/supabase-data/actions/patients/psychologist-patient-guardians-insert.codegen"
// TODO: Narrow the input type based on your action's requirements
type MutationInput = unknown

export function usePsychologistPatientGuardiansMutation(): UseMutationResult<unknown, Error, MutationInput, unknown> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (_input: MutationInput) => {
      // TODO: Replace with actual action call
      // return insertPsychologistPatientGuardiansAction(_input as any)
      throw new Error("Wire Server Action in mutationFn")
    },
    onSettled: async () => {
      // TODO: Invalidate precise query keys
      await queryClient.invalidateQueries({ queryKey: patientsQueryKeys.psychologistPatientGuardians() })
    },
  })
}
