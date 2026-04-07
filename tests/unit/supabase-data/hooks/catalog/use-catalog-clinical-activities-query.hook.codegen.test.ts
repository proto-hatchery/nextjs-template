/**
 * Unit tests for useCatalogClinicalActivitiesQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useCatalogClinicalActivitiesQuery } from "@workspace/supabase-data/hooks/catalog/use-catalog-clinical-activities-query.hook.codegen"
import { catalogQueryKeys } from "@workspace/supabase-data/hooks/catalog/query-keys.codegen"

describe("useCatalogClinicalActivitiesQuery", () => {
  it("should export the generated hook", () => {
    expect(useCatalogClinicalActivitiesQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(catalogQueryKeys.catalogClinicalActivitiesList({})).toBeDefined()
  })
})
