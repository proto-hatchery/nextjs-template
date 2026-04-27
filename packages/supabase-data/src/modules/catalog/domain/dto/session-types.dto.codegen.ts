// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const SessionTypesDTOSchema = z.object({
  code: looseCell,
  createdAt: looseCell,
  defaultDurationMinutes: looseCell,
  id: looseCell,
  name: looseCell,
  updatedAt: looseCell,
})

type SessionTypesDTO = z.infer<typeof SessionTypesDTOSchema>

export { SessionTypesDTOSchema, type SessionTypesDTO }
