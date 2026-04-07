/**
 * useCatalogDocumentTemplatesQuery — TanStack Query wrapper for a Server Action.
 * 
 * TODO: Wire the Server Action import and replace the queryFn body.
 * Do not add console.log — observability lives in the action (logServerEvent).
 * 
 * @module @workspace/supabase-data/hooks/catalog/use-catalog-document-templates-query.hook
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use client"

import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { catalogQueryKeys } from "@workspace/supabase-data/hooks/catalog/query-keys.codegen"

// TODO: import { listCatalogDocumentTemplatesAction } from "@workspace/supabase-data/actions/catalog/catalog-document-templates-list.codegen"
// TODO: Narrow the input type based on your action's requirements
type QueryFilters = Record<string, unknown>

export function useCatalogDocumentTemplatesQuery(filters?: QueryFilters): UseQueryResult<unknown, Error> {
  return useQuery({
    queryKey: catalogQueryKeys.catalogDocumentTemplatesList(filters),
    queryFn: async () => {
      // TODO: Replace with actual action call
      // return listCatalogDocumentTemplatesAction(filters ?? {})
      throw new Error("Wire Server Action in queryFn")
    },
  })
}
