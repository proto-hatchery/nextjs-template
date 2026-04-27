// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const PsychologistPatientAssessmentsDTOSchema = z.object({
  appliedAt: looseCell,
  clinicalNoteId: looseCell,
  createdAt: looseCell,
  createdBy: looseCell,
  fileUrl: looseCell,
  id: looseCell,
  interpretation: looseCell,
  isArchived: looseCell,
  name: looseCell,
  notes: looseCell,
  patientId: looseCell,
  psychologistClientId: looseCell,
  psychologistId: looseCell,
  psychologistNotes: looseCell,
  results: looseCell,
  status: looseCell,
  tags: looseCell,
  testDate: looseCell,
  testId: looseCell,
  testName: looseCell,
  testType: looseCell,
  updatedAt: looseCell,
  updatedBy: looseCell,
})

type PsychologistPatientAssessmentsDTO = z.infer<typeof PsychologistPatientAssessmentsDTOSchema>

export { PsychologistPatientAssessmentsDTOSchema, type PsychologistPatientAssessmentsDTO }
