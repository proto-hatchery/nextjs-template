// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const ReferenceValuesDTOSchema = z.object({
  category: looseCell,
  createdAt: looseCell,
  id: looseCell,
  isActive: looseCell,
  labelPt: looseCell,
  metadata: looseCell,
  updatedAt: looseCell,
  value: looseCell,
})

type ReferenceValuesDTO = z.infer<typeof ReferenceValuesDTOSchema>

export { ReferenceValuesDTOSchema, type ReferenceValuesDTO }
