/**
 * Unit tests for usePsychologistPatientGuardianDocumentsQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistPatientGuardianDocumentsQuery } from "@workspace/supabase-data/hooks/documents/use-psychologist-patient-guardian-documents-query.hook.codegen"
import { documentsQueryKeys } from "@workspace/supabase-data/hooks/documents/query-keys.codegen"

describe("usePsychologistPatientGuardianDocumentsQuery", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistPatientGuardianDocumentsQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(documentsQueryKeys.psychologistPatientGuardianDocumentsList({})).toBeDefined()
  })
})
