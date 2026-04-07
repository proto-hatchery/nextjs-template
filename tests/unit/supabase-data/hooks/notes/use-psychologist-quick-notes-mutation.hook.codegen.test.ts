/**
 * Unit tests for usePsychologistQuickNotesMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistQuickNotesMutation } from "@workspace/supabase-data/hooks/notes/use-psychologist-quick-notes-mutation.hook.codegen"
import { notesQueryKeys } from "@workspace/supabase-data/hooks/notes/query-keys.codegen"

describe("usePsychologistQuickNotesMutation", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistQuickNotesMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(notesQueryKeys.psychologistQuickNotes()).toBeDefined()
  })
})
