export interface SubStep {
  id: string;
  label: string;
}

export interface StepGroup {
  id: string;
  label: string;
  subSteps: SubStep[];
}

export interface OnboardingConfig {
  groups: StepGroup[];
  allSubSteps: string[];
}
