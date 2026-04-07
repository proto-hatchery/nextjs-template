/**
 * Unit tests for useCatalogDocumentTemplatesQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useCatalogDocumentTemplatesQuery } from "@workspace/supabase-data/hooks/catalog/use-catalog-document-templates-query.hook.codegen"
import { catalogQueryKeys } from "@workspace/supabase-data/hooks/catalog/query-keys.codegen"

describe("useCatalogDocumentTemplatesQuery", () => {
  it("should export the generated hook", () => {
    expect(useCatalogDocumentTemplatesQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(catalogQueryKeys.catalogDocumentTemplatesList({})).toBeDefined()
  })
})
