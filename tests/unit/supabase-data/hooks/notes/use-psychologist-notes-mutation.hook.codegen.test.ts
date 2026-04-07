/**
 * Unit tests for usePsychologistNotesMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistNotesMutation } from "@workspace/supabase-data/hooks/notes/use-psychologist-notes-mutation.hook.codegen"
import { notesQueryKeys } from "@workspace/supabase-data/hooks/notes/query-keys.codegen"

describe("usePsychologistNotesMutation", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistNotesMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(notesQueryKeys.psychologistNotes()).toBeDefined()
  })
})
