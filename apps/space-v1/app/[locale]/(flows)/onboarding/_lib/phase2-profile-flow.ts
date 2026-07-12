export type FlowStep =
  | "identity"
  | "professional"
  | "subscription"
  | "services"
  | "locations"
  | "availability"
  | "slug"
  | "links"
  | "visual"
  | "specialties"
  | "education"
  | "experience"
  | "publish";

export type ProfileStep = Extract<
  FlowStep,
  "slug" | "links" | "visual" | "specialties" | "education" | "experience" | "publish"
>;

export interface OnboardingTimelineItem {
  id: string;
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  type: "academic" | "professional";
}

export interface OnboardingLink {
  id: string;
  title: string;
  url: string;
  active: boolean;
}

export interface OnboardingData {
  slug: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  avatarPath: string | undefined;
  specialties: string[];
  therapeuticApproaches: string[];
  academicTimeline: OnboardingTimelineItem[];
  professionalTimeline: OnboardingTimelineItem[];
  showInMarketplace: boolean;
  acceptingNewPatients: boolean;
  links: OnboardingLink[];
}

export interface SessionData {
  step?: ProfileStep;
  data?: Partial<OnboardingData>;
  completedSteps?: string[];
}

export const STEP_TO_DRAFT_STEP: Record<ProfileStep, number> = {
  slug: 5,
  links: 5,
  visual: 5,
  specialties: 6,
  education: 6,
  experience: 6,
  publish: 7,
};

export const PROFILE_STEP_ORDER: ProfileStep[] = [
  "slug",
  "links",
  "visual",
  "specialties",
  "education",
  "experience",
  "publish",
];

export const CONFIG_STEP_ORDER: FlowStep[] = ["services", "locations", "availability"];

export const ONBOARDING_STORAGE_KEY = "fluri:onboarding:profile";

export function createEmptyOnboardingData(): OnboardingData {
  return {
    slug: "",
    displayName: "",
    bio: "",
    avatarUrl: "",
    avatarPath: undefined,
    specialties: [],
    therapeuticApproaches: [],
    academicTimeline: [],
    professionalTimeline: [],
    showInMarketplace: false,
    acceptingNewPatients: false,
    links: [],
  };
}

export function buildProfileDraftPayload(profileData: OnboardingData) {
  return {
    slug: profileData.slug,
    displayName: profileData.displayName,
    bio: profileData.bio,
    avatarUrl: profileData.avatarUrl,
    specialties: profileData.specialties,
    therapeuticApproaches: profileData.therapeuticApproaches,
    academicTimeline: profileData.academicTimeline,
    professionalTimeline: profileData.professionalTimeline,
    links: profileData.links,
  };
}
