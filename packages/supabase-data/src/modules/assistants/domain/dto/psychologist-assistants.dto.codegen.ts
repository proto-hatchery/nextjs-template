// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const PsychologistAssistantsDTOSchema = z.object({
  assistantId: looseCell,
  createdAt: looseCell,
  metadata: looseCell,
  psychologistId: looseCell,
  revokedAt: looseCell,
})

type PsychologistAssistantsDTO = z.infer<typeof PsychologistAssistantsDTOSchema>

export { PsychologistAssistantsDTOSchema, type PsychologistAssistantsDTO }
