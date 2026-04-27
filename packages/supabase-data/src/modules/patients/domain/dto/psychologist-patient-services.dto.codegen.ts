// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const PsychologistPatientServicesDTOSchema = z.object({
  createdAt: looseCell,
  id: looseCell,
  priceCents: looseCell,
  psychologistId: looseCell,
  psychologistPatientId: looseCell,
  serviceId: looseCell,
  updatedAt: looseCell,
})

type PsychologistPatientServicesDTO = z.infer<typeof PsychologistPatientServicesDTOSchema>

export { PsychologistPatientServicesDTOSchema, type PsychologistPatientServicesDTO }
