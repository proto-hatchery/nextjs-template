export type OnboardingSuccessStatus = "processing" | "activating" | "ready";

export interface PsychologistSubscriptionData {
  subscription_status: string | null;
  onboarding_completed: boolean | null;
}

export interface ProcessCheckoutResult {
  success: boolean;
  error?: string;
}

export interface CheckoutState {
  status: OnboardingSuccessStatus;
  error: string | null;
}
