// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const PsychologistOnboardingStateDTOSchema = z.object({
  abandonedAt: looseCell,
  completionPercentage: looseCell,
  configurationStepCompleted: looseCell,
  createdAt: looseCell,
  currentStep: looseCell,
  draftData: looseCell,
  identityStepCompleted: looseCell,
  lastResumedAt: looseCell,
  onboardingCompletedAt: looseCell,
  operationalStepCompleted: looseCell,
  paymentStepCompleted: looseCell,
  professionalStepCompleted: looseCell,
  profileStepCompleted: looseCell,
  psychologistId: looseCell,
  totalSteps: looseCell,
  updatedAt: looseCell
})

type PsychologistOnboardingStateDTO = z.infer<typeof PsychologistOnboardingStateDTOSchema>

export { PsychologistOnboardingStateDTOSchema, type PsychologistOnboardingStateDTO }
