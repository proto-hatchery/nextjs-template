/**
 * Unit tests for usePsychologistPatientGuardianDocumentsMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistPatientGuardianDocumentsMutation } from "@workspace/supabase-data/hooks/documents/use-psychologist-patient-guardian-documents-mutation.hook.codegen"
import { documentsQueryKeys } from "@workspace/supabase-data/hooks/documents/query-keys.codegen"

describe("usePsychologistPatientGuardianDocumentsMutation", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistPatientGuardianDocumentsMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(documentsQueryKeys.psychologistPatientGuardianDocuments()).toBeDefined()
  })
})
