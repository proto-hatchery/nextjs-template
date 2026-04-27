// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const PsychologistPatientMedicalItemsDTOSchema = z.object({
  createdAt: looseCell,
  description: looseCell,
  diagnosedDate: looseCell,
  dosage: looseCell,
  endDate: looseCell,
  frequency: looseCell,
  icd10Code: looseCell,
  id: looseCell,
  isActive: looseCell,
  itemKind: looseCell,
  kind: looseCell,
  name: looseCell,
  notes: looseCell,
  psychologistId: looseCell,
  psychologistPatientId: looseCell,
  startDate: looseCell,
  updatedAt: looseCell,
})

type PsychologistPatientMedicalItemsDTO = z.infer<typeof PsychologistPatientMedicalItemsDTOSchema>

export { PsychologistPatientMedicalItemsDTOSchema, type PsychologistPatientMedicalItemsDTO }
