import type { SupabaseClient } from "@supabase/supabase-js";
import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/errors/app-error";
import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  DetailedOnboardingStatusDTO,
  OnboardingDraftStateDTO,
  OnboardingPhase,
  OnboardingPhaseDraftDTO,
  OnboardingProgressDTO,
} from "../domain/dto/onboarding-state.dto";
import { OnboardingSupabaseRepository } from "../infrastructure/repositories/onboarding-supabase.repository";

function createRepository(supabase: SupabaseClient<Database>) {
  return new OnboardingSupabaseRepository(supabase);
}

export function getOnboardingDraftForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<Result<OnboardingDraftStateDTO, AppError>> {
  return createRepository(supabase).getDraft(userId);
}

export function getOnboardingPhaseDraftForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  phase: OnboardingPhase,
): Promise<Result<OnboardingPhaseDraftDTO, AppError>> {
  return createRepository(supabase).getPhaseDraft(userId, phase);
}

export function getOnboardingProgress(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<Result<OnboardingProgressDTO, AppError>> {
  return createRepository(supabase).getProgress(userId);
}

export function getOnboardingStatus(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<Result<boolean, AppError>> {
  return createRepository(supabase).getStatus(userId);
}

export function getDetailedOnboardingStatusForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<Result<DetailedOnboardingStatusDTO, AppError>> {
  return createRepository(supabase).getDetailedStatus(userId);
}
