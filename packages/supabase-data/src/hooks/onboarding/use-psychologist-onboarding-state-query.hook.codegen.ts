/**
 * usePsychologistOnboardingStateQuery — TanStack Query wrapper for a Server Action.
 * 
 * TODO: Wire the Server Action import and replace the queryFn body.
 * Do not add console.log — observability lives in the action (logServerEvent).
 * 
 * @module @workspace/supabase-data/hooks/onboarding/use-psychologist-onboarding-state-query.hook
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use client"

import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { onboardingQueryKeys } from "@workspace/supabase-data/hooks/onboarding/query-keys.codegen"

// TODO: import { listPsychologistOnboardingStateAction } from "@workspace/supabase-data/actions/onboarding/psychologist-onboarding-state-list.codegen"
// TODO: Narrow the input type based on your action's requirements
type QueryFilters = Record<string, unknown>

export function usePsychologistOnboardingStateQuery(filters?: QueryFilters): UseQueryResult<unknown, Error> {
  return useQuery({
    queryKey: onboardingQueryKeys.psychologistOnboardingStateList(filters),
    queryFn: async () => {
      // TODO: Replace with actual action call
      // return listPsychologistOnboardingStateAction(filters ?? {})
      throw new Error("Wire Server Action in queryFn")
    },
  })
}
