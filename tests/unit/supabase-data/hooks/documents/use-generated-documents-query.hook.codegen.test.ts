/**
 * Unit tests for useGeneratedDocumentsQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useGeneratedDocumentsQuery } from "@workspace/supabase-data/hooks/documents/use-generated-documents-query.hook.codegen"
import { documentsQueryKeys } from "@workspace/supabase-data/hooks/documents/query-keys.codegen"

describe("useGeneratedDocumentsQuery", () => {
  it("should export the generated hook", () => {
    expect(useGeneratedDocumentsQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(documentsQueryKeys.generatedDocumentsList({})).toBeDefined()
  })
})
