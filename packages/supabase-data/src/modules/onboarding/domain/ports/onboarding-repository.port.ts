import type { Result } from "neverthrow";
import type { AppError } from "../../../../lib/errors/app-error";
import type {
  CompleteOnboardingDTO,
  CompleteOnboardingPhaseDTO,
  DetailedOnboardingStatusDTO,
  OnboardingDraftStateDTO,
  OnboardingPhase,
  OnboardingPhaseDraftDTO,
  OnboardingProgressDTO,
} from "../dto/onboarding-state.dto";

export interface OnboardingRepository {
  getDraft(userId: string): Promise<Result<OnboardingDraftStateDTO, AppError>>;
  saveDraft(
    userId: string,
    step: number,
    data: Record<string, unknown>,
  ): Promise<Result<OnboardingDraftStateDTO, AppError>>;
  autoSavePhaseDraft(
    userId: string,
    phase: OnboardingPhase,
    draftData: Record<string, unknown>,
  ): Promise<Result<CompleteOnboardingPhaseDTO, AppError>>;
  getPhaseDraft(
    userId: string,
    phase: OnboardingPhase,
  ): Promise<Result<OnboardingPhaseDraftDTO, AppError>>;
  getProgress(userId: string): Promise<Result<OnboardingProgressDTO, AppError>>;
  getStatus(userId: string): Promise<Result<boolean, AppError>>;
  getDetailedStatus(userId: string): Promise<Result<DetailedOnboardingStatusDTO, AppError>>;
  completePhase(
    userId: string,
    phase: OnboardingPhase,
  ): Promise<Result<CompleteOnboardingPhaseDTO, AppError>>;
  completeOnboarding(): Promise<Result<CompleteOnboardingDTO, AppError>>;
}
