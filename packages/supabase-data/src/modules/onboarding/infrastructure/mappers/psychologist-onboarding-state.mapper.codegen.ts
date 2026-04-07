// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { Database } from "@workspace/supabase-infra/types/database"

import { PsychologistOnboardingStateDTOSchema, type PsychologistOnboardingStateDTO } from "@workspace/supabase-data/modules/onboarding/domain/dto/psychologist-onboarding-state.dto.codegen"

type PsychologistOnboardingStateRow = Database["public"]["Tables"]["psychologist_onboarding_state"]["Row"]
type PsychologistOnboardingStateInsert = Database["public"]["Tables"]["psychologist_onboarding_state"]["Insert"]
type PsychologistOnboardingStateUpdate = Database["public"]["Tables"]["psychologist_onboarding_state"]["Update"]

const PsychologistOnboardingStateFieldMappings = {
  abandonedAt: "abandoned_at",
  completionPercentage: "completion_percentage",
  configurationStepCompleted: "configuration_step_completed",
  createdAt: "created_at",
  currentStep: "current_step",
  draftData: "draft_data",
  identityStepCompleted: "identity_step_completed",
  lastResumedAt: "last_resumed_at",
  onboardingCompletedAt: "onboarding_completed_at",
  operationalStepCompleted: "operational_step_completed",
  paymentStepCompleted: "payment_step_completed",
  professionalStepCompleted: "professional_step_completed",
  profileStepCompleted: "profile_step_completed",
  psychologistId: "psychologist_id",
  totalSteps: "total_steps",
  updatedAt: "updated_at",
} as const

type PsychologistOnboardingStateField = keyof typeof PsychologistOnboardingStateFieldMappings

function fromPsychologistOnboardingStateRow(row: PsychologistOnboardingStateRow): PsychologistOnboardingStateDTO {
  const mapped = {
    abandonedAt: row.abandoned_at,
    completionPercentage: row.completion_percentage,
    configurationStepCompleted: row.configuration_step_completed,
    createdAt: row.created_at,
    currentStep: row.current_step,
    draftData: row.draft_data,
    identityStepCompleted: row.identity_step_completed,
    lastResumedAt: row.last_resumed_at,
    onboardingCompletedAt: row.onboarding_completed_at,
    operationalStepCompleted: row.operational_step_completed,
    paymentStepCompleted: row.payment_step_completed,
    professionalStepCompleted: row.professional_step_completed,
    profileStepCompleted: row.profile_step_completed,
    psychologistId: row.psychologist_id,
    totalSteps: row.total_steps,
    updatedAt: row.updated_at,
  }
  return PsychologistOnboardingStateDTOSchema.parse(mapped)
}

function toPsychologistOnboardingStateInsert(dto: Partial<PsychologistOnboardingStateDTO>): PsychologistOnboardingStateInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(PsychologistOnboardingStateFieldMappings) as Array<
    [PsychologistOnboardingStateField, (typeof PsychologistOnboardingStateFieldMappings)[PsychologistOnboardingStateField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as PsychologistOnboardingStateInsert
}

function toPsychologistOnboardingStateUpdate(dto: Partial<PsychologistOnboardingStateDTO>): PsychologistOnboardingStateUpdate {
  return toPsychologistOnboardingStateInsert(dto) as PsychologistOnboardingStateUpdate
}

export { fromPsychologistOnboardingStateRow, toPsychologistOnboardingStateInsert, toPsychologistOnboardingStateUpdate }
