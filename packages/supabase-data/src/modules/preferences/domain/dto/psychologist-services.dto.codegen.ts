// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const PsychologistServicesDTOSchema = z.object({
  catalogId: looseCell,
  createdAt: looseCell,
  description: looseCell,
  durationMinutes: looseCell,
  id: looseCell,
  isActive: looseCell,
  isPublic: looseCell,
  name: looseCell,
  price: looseCell,
  psychologistId: looseCell,
  serviceId: looseCell,
  sortOrder: looseCell,
  updatedAt: looseCell,
})

type PsychologistServicesDTO = z.infer<typeof PsychologistServicesDTOSchema>

export { PsychologistServicesDTOSchema, type PsychologistServicesDTO }
