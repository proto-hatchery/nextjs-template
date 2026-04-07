/**
 * Unit tests for usePsychologistNotesQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistNotesQuery } from "@workspace/supabase-data/hooks/notes/use-psychologist-notes-query.hook.codegen"
import { notesQueryKeys } from "@workspace/supabase-data/hooks/notes/query-keys.codegen"

describe("usePsychologistNotesQuery", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistNotesQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(notesQueryKeys.psychologistNotesList({})).toBeDefined()
  })
})
