// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  PsychologistOnboardingStateDTOSchema,
  type PsychologistOnboardingStateDTO,
} from "@workspace/supabase-data/modules/onboarding/domain/dto/psychologist-onboarding-state.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type PsychologistOnboardingStateRow =
  Database["public"]["Views"]["psychologist_onboarding_summary"]["Row"]
type PsychologistOnboardingStateInsert =
  Database["public"]["Tables"]["psychologist_onboarding_state"]["Insert"]
type PsychologistOnboardingStateUpdate =
  Database["public"]["Tables"]["psychologist_onboarding_state"]["Update"]

const PsychologistOnboardingStateFieldMappings = {
  abandonedAt: "abandoned_at",
  completionPercentage: "completion_percentage",
  configurationStepCompleted: "configuration_step_completed",
  currentStep: "current_step",
  essentialComplete: "essential_complete",
  fullyComplete: "fully_complete",
  identityStepCompleted: "identity_step_completed",
  lastResumedAt: "last_resumed_at",
  nextPendingStep: "next_pending_step",
  onboardingCompletedAt: "onboarding_completed_at",
  paymentStepCompleted: "payment_step_completed",
  professionalStepCompleted: "professional_step_completed",
  profileStepCompleted: "profile_step_completed",
  psychologistId: "psychologist_id",
  subscriptionStatus: "subscription_status",
  totalSteps: "total_steps",
} as const

type PsychologistOnboardingStateField = keyof typeof PsychologistOnboardingStateFieldMappings

function fromPsychologistOnboardingStateRow(
  row: PsychologistOnboardingStateRow
): PsychologistOnboardingStateDTO {
  const mapped = {
    abandonedAt: null,
    completionPercentage: row.completion_percentage,
    configurationStepCompleted: row.configuration_step_completed,
    currentStep: row.current_step,
    essentialComplete: row.essential_complete,
    fullyComplete: row.fully_complete,
    identityStepCompleted: row.identity_step_completed,
    lastResumedAt: null,
    nextPendingStep: row.next_pending_step,
    onboardingCompletedAt: row.fully_complete ? new Date().toISOString() : null,
    paymentStepCompleted: row.payment_step_completed,
    professionalStepCompleted: row.professional_step_completed,
    profileStepCompleted: row.profile_step_completed,
    psychologistId: row.psychologist_id,
    subscriptionStatus: null,
    totalSteps: row.total_steps,
  }
  return PsychologistOnboardingStateDTOSchema.parse(mapped)
}

function toPsychologistOnboardingStateInsert(
  dto: Partial<PsychologistOnboardingStateDTO>
): PsychologistOnboardingStateInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(
    PsychologistOnboardingStateFieldMappings
  ) as Array<
    [
      PsychologistOnboardingStateField,
      (typeof PsychologistOnboardingStateFieldMappings)[PsychologistOnboardingStateField],
    ]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as PsychologistOnboardingStateInsert
}

function toPsychologistOnboardingStateUpdate(
  dto: Partial<PsychologistOnboardingStateDTO>
): PsychologistOnboardingStateUpdate {
  return toPsychologistOnboardingStateInsert(dto) as PsychologistOnboardingStateUpdate
}

export {
  fromPsychologistOnboardingStateRow,
  toPsychologistOnboardingStateInsert,
  toPsychologistOnboardingStateUpdate,
}
