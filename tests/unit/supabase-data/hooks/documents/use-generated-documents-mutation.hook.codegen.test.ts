/**
 * Unit tests for useGeneratedDocumentsMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useGeneratedDocumentsMutation } from "@workspace/supabase-data/hooks/documents/use-generated-documents-mutation.hook.codegen"
import { documentsQueryKeys } from "@workspace/supabase-data/hooks/documents/query-keys.codegen"

describe("useGeneratedDocumentsMutation", () => {
  it("should export the generated hook", () => {
    expect(useGeneratedDocumentsMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(documentsQueryKeys.generatedDocuments()).toBeDefined()
  })
})
