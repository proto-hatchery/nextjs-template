import { type StepGroup } from "@workspace/brand/onboarding";

export type Phase2OnboardingSubStepId =
  | "identity"
  | "professional"
  | "subscription"
  | "services"
  | "locations"
  | "availability"
  // Site pessoal (formerly fase3)
  | "slug"
  | "links"
  | "visual"
  | "specialties"
  | "education"
  | "experience"
  | "publish";

export const PHASE2_ONBOARDING_GROUPS: StepGroup[] = [
  {
    id: "profile_basic",
    label: "DADOS BÁSICOS",
    subSteps: [
      { id: "identity", label: "Informações pessoais" },
      { id: "professional", label: "Profissional" },
    ],
  },
  {
    id: "subscription",
    label: "ASSINATURA",
    subSteps: [{ id: "subscription", label: "Plano" }],
  },
  {
    id: "operations",
    label: "ATENDIMENTO",
    subSteps: [
      { id: "services", label: "Serviços" },
      { id: "locations", label: "Locais" },
      { id: "availability", label: "Horários" },
    ],
  },
  {
    id: "site",
    label: "MEU SITE",
    subSteps: [
      { id: "slug", label: "URL" },
      { id: "links", label: "Links" },
      { id: "visual", label: "Visual" },
      { id: "specialties", label: "Palavras-chave" },
      { id: "education", label: "Formação" },
      { id: "experience", label: "Experiência" },
      { id: "publish", label: "Publicar" },
    ],
  },
];

export const ALL_PHASE2_SUB_STEPS: Phase2OnboardingSubStepId[] = [
  "identity",
  "professional",
  "subscription",
  "services",
  "locations",
  "availability",
  "slug",
  "links",
  "visual",
  "specialties",
  "education",
  "experience",
  "publish",
];
