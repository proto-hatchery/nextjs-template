/**
 * Unit tests for usePsychologistPatientEmergencyContactsQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistPatientEmergencyContactsQuery } from "@workspace/supabase-data/hooks/patients/use-psychologist-patient-emergency-contacts-query.hook.codegen"
import { patientsQueryKeys } from "@workspace/supabase-data/hooks/patients/query-keys.codegen"

describe("usePsychologistPatientEmergencyContactsQuery", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistPatientEmergencyContactsQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(patientsQueryKeys.psychologistPatientEmergencyContactsList({})).toBeDefined()
  })
})
