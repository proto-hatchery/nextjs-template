// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const PsychologistPatientGuardiansDTOSchema = z.object({
  city: looseCell,
  complement: looseCell,
  country: looseCell,
  cpf: looseCell,
  createdAt: looseCell,
  dateOfBirth: looseCell,
  email: looseCell,
  fullName: looseCell,
  guardianType: looseCell,
  id: looseCell,
  name: looseCell,
  neighborhood: looseCell,
  number: looseCell,
  patientId: looseCell,
  phone: looseCell,
  postalCode: looseCell,
  psychologistId: looseCell,
  relationship: looseCell,
  rg: looseCell,
  state: looseCell,
  status: looseCell,
  street: looseCell,
  updatedAt: looseCell,
})

type PsychologistPatientGuardiansDTO = z.infer<typeof PsychologistPatientGuardiansDTOSchema>

export { PsychologistPatientGuardiansDTOSchema, type PsychologistPatientGuardiansDTO }
