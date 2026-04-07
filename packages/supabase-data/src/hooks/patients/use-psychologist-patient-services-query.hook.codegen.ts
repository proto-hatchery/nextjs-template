/**
 * usePsychologistPatientServicesQuery — TanStack Query wrapper for a Server Action.
 * 
 * TODO: Wire the Server Action import and replace the queryFn body.
 * Do not add console.log — observability lives in the action (logServerEvent).
 * 
 * @module @workspace/supabase-data/hooks/patients/use-psychologist-patient-services-query.hook
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use client"

import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { patientsQueryKeys } from "@workspace/supabase-data/hooks/patients/query-keys.codegen"

// TODO: import { listPsychologistPatientServicesAction } from "@workspace/supabase-data/actions/patients/psychologist-patient-services-list.codegen"
// TODO: Narrow the input type based on your action's requirements
type QueryFilters = Record<string, unknown>

export function usePsychologistPatientServicesQuery(filters?: QueryFilters): UseQueryResult<unknown, Error> {
  return useQuery({
    queryKey: patientsQueryKeys.psychologistPatientServicesList(filters),
    queryFn: async () => {
      // TODO: Replace with actual action call
      // return listPsychologistPatientServicesAction(filters ?? {})
      throw new Error("Wire Server Action in queryFn")
    },
  })
}
