// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"

import type { PsychologistOnboardingStateRepository, PsychologistOnboardingStateListParams, PsychologistOnboardingStateListResult } from "@workspace/supabase-data/modules/onboarding/domain/ports/psychologist-onboarding-state-repository.port.codegen"
import { fromPsychologistOnboardingStateRow, toPsychologistOnboardingStateInsert, toPsychologistOnboardingStateUpdate } from "@workspace/supabase-data/modules/onboarding/infrastructure/mappers/psychologist-onboarding-state.mapper.codegen"
import type { PsychologistOnboardingStateDTO } from "@workspace/supabase-data/modules/onboarding/domain/dto/psychologist-onboarding-state.dto.codegen"

class PsychologistOnboardingStateSupabaseRepository implements PsychologistOnboardingStateRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async list(params: PsychologistOnboardingStateListParams): Promise<PsychologistOnboardingStateListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase.from("psychologist_onboarding_state").select("abandoned_at, completion_percentage, configuration_step_completed, created_at, current_step, draft_data, identity_step_completed, last_resumed_at, onboarding_completed_at, operational_step_completed, payment_step_completed, professional_step_completed, profile_step_completed, psychologist_id, total_steps, updated_at").range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list psychologist_onboarding_state.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromPsychologistOnboardingStateRow(row))
    return { rows }
  }

  async insert(data: Partial<PsychologistOnboardingStateDTO>): Promise<PsychologistOnboardingStateDTO> {
    const payload = toPsychologistOnboardingStateInsert(data)
    const { data: row, error } = await this.supabase
      .from("psychologist_onboarding_state")
      .insert(payload)
      .select("abandoned_at, completion_percentage, configuration_step_completed, created_at, current_step, draft_data, identity_step_completed, last_resumed_at, onboarding_completed_at, operational_step_completed, payment_step_completed, professional_step_completed, profile_step_completed, psychologist_id, total_steps, updated_at")
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to insert psychologist_onboarding_state.", { cause: error })
    }
    return fromPsychologistOnboardingStateRow(row)
  }

  async update(id: string, patch: Partial<PsychologistOnboardingStateDTO>): Promise<PsychologistOnboardingStateDTO> {
    const payload = toPsychologistOnboardingStateUpdate(patch)
    const { data: row, error } = await this.supabase
      .from("psychologist_onboarding_state")
      .update(payload)
      .eq("id", id)
      .select("abandoned_at, completion_percentage, configuration_step_completed, created_at, current_step, draft_data, identity_step_completed, last_resumed_at, onboarding_completed_at, operational_step_completed, payment_step_completed, professional_step_completed, profile_step_completed, psychologist_id, total_steps, updated_at")
      .single()
    if (error) {
      throw new SupabaseRepositoryError("Failed to update psychologist_onboarding_state.", { cause: error })
    }
    return fromPsychologistOnboardingStateRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("psychologist_onboarding_state").delete().eq("id", id)
    if (error) {
      throw new SupabaseRepositoryError("Failed to delete psychologist_onboarding_state.", { cause: error })
    }
  }

}

export { PsychologistOnboardingStateSupabaseRepository }
