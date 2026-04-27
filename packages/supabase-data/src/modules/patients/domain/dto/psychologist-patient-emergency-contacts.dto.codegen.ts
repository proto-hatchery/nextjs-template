// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const PsychologistPatientEmergencyContactsDTOSchema = z.object({
  contactName: looseCell,
  createdAt: looseCell,
  createdBy: looseCell,
  email: looseCell,
  id: looseCell,
  isPrimary: looseCell,
  notes: looseCell,
  phone: looseCell,
  psychologistPatientId: looseCell,
  relationship: looseCell,
  updatedAt: looseCell,
  updatedBy: looseCell,
})

type PsychologistPatientEmergencyContactsDTO = z.infer<
  typeof PsychologistPatientEmergencyContactsDTOSchema
>

export {
  PsychologistPatientEmergencyContactsDTOSchema,
  type PsychologistPatientEmergencyContactsDTO,
}
