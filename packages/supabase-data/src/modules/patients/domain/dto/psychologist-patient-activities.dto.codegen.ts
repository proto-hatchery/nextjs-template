// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const PsychologistPatientActivitiesDTOSchema = z.object({
  activityId: looseCell,
  assignedAt: looseCell,
  completedAt: looseCell,
  createdAt: looseCell,
  createdBy: looseCell,
  dueDate: looseCell,
  id: looseCell,
  instructions: looseCell,
  isArchived: looseCell,
  patientFeedback: looseCell,
  patientId: looseCell,
  psychologistClientId: looseCell,
  psychologistId: looseCell,
  responseData: looseCell,
  status: looseCell,
  submittedAt: looseCell,
  therapistComment: looseCell,
  title: looseCell,
  updatedAt: looseCell,
  updatedBy: looseCell,
})

type PsychologistPatientActivitiesDTO = z.infer<typeof PsychologistPatientActivitiesDTOSchema>

export { PsychologistPatientActivitiesDTOSchema, type PsychologistPatientActivitiesDTO }
