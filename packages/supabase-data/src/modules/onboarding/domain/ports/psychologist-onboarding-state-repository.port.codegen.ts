// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { PsychologistOnboardingStateDTO } from "@workspace/supabase-data/modules/onboarding/domain/dto/psychologist-onboarding-state.dto.codegen"

export interface PsychologistOnboardingStateListParams {
  limit?: number
  offset?: number
}

export interface PsychologistOnboardingStateListResult {
  rows: PsychologistOnboardingStateDTO[]
}

interface PsychologistOnboardingStateRepository {
  list(params: PsychologistOnboardingStateListParams): Promise<PsychologistOnboardingStateListResult>
  insert(data: Partial<PsychologistOnboardingStateDTO>): Promise<PsychologistOnboardingStateDTO>
  update(id: string, patch: Partial<PsychologistOnboardingStateDTO>): Promise<PsychologistOnboardingStateDTO>
  delete(id: string): Promise<void>
}

export { type PsychologistOnboardingStateRepository }
