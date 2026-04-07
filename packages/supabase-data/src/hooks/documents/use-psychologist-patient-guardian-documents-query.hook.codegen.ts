/**
 * usePsychologistPatientGuardianDocumentsQuery — TanStack Query wrapper for a Server Action.
 * 
 * TODO: Wire the Server Action import and replace the queryFn body.
 * Do not add console.log — observability lives in the action (logServerEvent).
 * 
 * @module @workspace/supabase-data/hooks/documents/use-psychologist-patient-guardian-documents-query.hook
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use client"

import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { documentsQueryKeys } from "@workspace/supabase-data/hooks/documents/query-keys.codegen"

// TODO: import { listPsychologistPatientGuardianDocumentsAction } from "@workspace/supabase-data/actions/documents/psychologist-patient-guardian-documents-list.codegen"
// TODO: Narrow the input type based on your action's requirements
type QueryFilters = Record<string, unknown>

export function usePsychologistPatientGuardianDocumentsQuery(filters?: QueryFilters): UseQueryResult<unknown, Error> {
  return useQuery({
    queryKey: documentsQueryKeys.psychologistPatientGuardianDocumentsList(filters),
    queryFn: async () => {
      // TODO: Replace with actual action call
      // return listPsychologistPatientGuardianDocumentsAction(filters ?? {})
      throw new Error("Wire Server Action in queryFn")
    },
  })
}
