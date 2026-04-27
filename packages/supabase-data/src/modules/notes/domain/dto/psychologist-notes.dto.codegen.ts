// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const PsychologistNotesDTOSchema = z.object({
  content: looseCell,
  createdAt: looseCell,
  createdBy: looseCell,
  encodedContent: looseCell,
  id: looseCell,
  isArchived: looseCell,
  noteType: looseCell,
  parentNoteId: looseCell,
  patientId: looseCell,
  psychologistClientId: looseCell,
  psychologistId: looseCell,
  sessionId: looseCell,
  tags: looseCell,
  title: looseCell,
  updatedAt: looseCell,
})

type PsychologistNotesDTO = z.infer<typeof PsychologistNotesDTOSchema>

export { PsychologistNotesDTOSchema, type PsychologistNotesDTO }
