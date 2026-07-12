import type { SupabaseClient } from "@supabase/supabase-js";
import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/errors/app-error";
import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  CompleteOnboardingDTO,
  CompleteOnboardingPhaseDTO,
  OnboardingDraftStateDTO,
  OnboardingPhase,
} from "../domain/dto/onboarding-state.dto";
import { OnboardingSupabaseRepository } from "../infrastructure/repositories/onboarding-supabase.repository";

function createRepository(supabase: SupabaseClient<Database>) {
  return new OnboardingSupabaseRepository(supabase);
}

export function saveOnboardingDraftForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  step: number,
  data: Record<string, unknown>,
): Promise<Result<OnboardingDraftStateDTO, AppError>> {
  return createRepository(supabase).saveDraft(userId, step, data);
}

export function autoSaveOnboardingPhaseDraftForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  phase: OnboardingPhase,
  draftData: Record<string, unknown>,
): Promise<Result<CompleteOnboardingPhaseDTO, AppError>> {
  return createRepository(supabase).autoSavePhaseDraft(userId, phase, draftData);
}

export function completeOnboardingPhaseForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  phase: OnboardingPhase,
): Promise<Result<CompleteOnboardingPhaseDTO, AppError>> {
  return createRepository(supabase).completePhase(userId, phase);
}

export function completeOnboardingForUser(
  supabase: SupabaseClient<Database>,
): Promise<Result<CompleteOnboardingDTO, AppError>> {
  return createRepository(supabase).completeOnboarding();
}
