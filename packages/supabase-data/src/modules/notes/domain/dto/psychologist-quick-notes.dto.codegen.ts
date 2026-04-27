// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const PsychologistQuickNotesDTOSchema = z.object({
  completedAt: looseCell,
  createdAt: looseCell,
  dueDate: looseCell,
  id: looseCell,
  isCompleted: looseCell,
  priority: looseCell,
  psychologistId: looseCell,
  title: looseCell,
  updatedAt: looseCell,
})

type PsychologistQuickNotesDTO = z.infer<typeof PsychologistQuickNotesDTOSchema>

export { PsychologistQuickNotesDTOSchema, type PsychologistQuickNotesDTO }
