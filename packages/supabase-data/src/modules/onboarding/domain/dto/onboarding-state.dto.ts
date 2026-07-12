import type { OnboardingDraftData } from "@workspace/supabase-data/types/entities";

export type OnboardingPhase = 1 | 2 | 3 | 4;

export interface OnboardingDraftStateDTO {
  currentStep: number;
  draftData: OnboardingDraftData;
}

export interface OnboardingPhaseDraftDTO {
  draftData: Record<string, unknown> | null;
}

export interface OnboardingProgressDTO {
  essentialComplete: boolean;
  fullyComplete: boolean;
  completionPercentage: number;
  currentStep: number;
  totalSteps: number;
  nextPendingStep: string | null;
  steps: {
    payment: boolean;
    identity: boolean;
    professional: boolean;
    configuration: boolean;
    profile: boolean;
  };
}

export interface DetailedOnboardingStatusDTO {
  phase: OnboardingPhase;
  progress: number;
  phase1Complete: boolean;
  phase2Complete: boolean;
  phase3Complete: boolean;
  phase4Complete: boolean;
}

export interface CompleteOnboardingPhaseDTO {
  lastSavedAt: string;
}

export interface CompleteOnboardingDTO {
  success: true;
}

export const DEFAULT_ONBOARDING_DRAFT_STATE: Readonly<OnboardingDraftStateDTO> = {
  currentStep: 1,
  draftData: {},
};

export const DEFAULT_ONBOARDING_PROGRESS: Readonly<OnboardingProgressDTO> = {
  essentialComplete: false,
  fullyComplete: false,
  completionPercentage: 0,
  currentStep: 1,
  totalSteps: 5,
  nextPendingStep: "subscription",
  steps: {
    payment: false,
    identity: false,
    professional: false,
    configuration: false,
    profile: false,
  },
};

export const DEFAULT_DETAILED_ONBOARDING_STATUS: Readonly<DetailedOnboardingStatusDTO> = {
  phase: 1,
  progress: 0,
  phase1Complete: false,
  phase2Complete: false,
  phase3Complete: false,
  phase4Complete: false,
};

export function isOnboardingPhase(value: number): value is OnboardingPhase {
  return value === 1 || value === 2 || value === 3 || value === 4;
}
