export type OnboardingStepId =
  | "identity"
  | "phone-verification"
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

export type OnboardingPhase = 1 | 2 | 3 | 4;

export interface StepDefinition {
  id: OnboardingStepId;
  phase: OnboardingPhase;
  title: string;
  description: string;
  route: string;
  prerequisites: OnboardingStepId[];
}

export const ONBOARDING_STEPS: StepDefinition[] = [
  {
    id: "identity",
    phase: 1,
    title: "Sobre você",
    description: "Informações básicas do perfil",
    route: "/onboarding/identity",
    prerequisites: [],
  },
  // phone-verification step temporarily disabled
  // {
  //   id: "phone-verification",
  //   phase: 1,
  //   title: "Verificar telefone",
  //   description: "Confirme seu número de celular",
  //   route: "/onboarding/phone-verification",
  //   prerequisites: ["identity"],
  // },
  {
    id: "professional",
    phase: 1,
    title: "Dados profissionais",
    description: "CRP e especialidades",
    route: "/onboarding/professional",
    prerequisites: ["identity"],
  },
  {
    id: "subscription",
    phase: 1,
    title: "Assinatura",
    description: "Escolha seu plano",
    route: "/onboarding/subscription",
    prerequisites: ["identity", "professional"],
  },
  {
    id: "services",
    phase: 2,
    title: "Serviços",
    description: "Configure seus atendimentos",
    route: "/onboarding/services",
    prerequisites: ["identity", "professional", "subscription"],
  },
  {
    id: "locations",
    phase: 2,
    title: "Locais",
    description: "Onde você atende",
    route: "/onboarding/locations",
    prerequisites: ["services"],
  },
  {
    id: "availability",
    phase: 2,
    title: "Disponibilidade",
    description: "Seus horários de atendimento",
    route: "/onboarding/availability",
    prerequisites: ["services", "locations"],
  },
  {
    id: "slug",
    phase: 2,
    title: "URL",
    description: "Escolha seu link único",
    route: "/onboarding/slug",
    prerequisites: ["availability"],
  },
  {
    id: "links",
    phase: 2,
    title: "Links",
    description: "Links essenciais",
    route: "/onboarding/links",
    prerequisites: ["slug"],
  },
  {
    id: "visual",
    phase: 2,
    title: "Identificação",
    description: "Foto e bio",
    route: "/onboarding/visual",
    prerequisites: ["links"],
  },
  {
    id: "specialties",
    phase: 2,
    title: "Palavras-chave",
    description: "Especialidades e abordagens",
    route: "/onboarding/specialties",
    prerequisites: ["visual"],
  },
  {
    id: "education",
    phase: 2,
    title: "Formação",
    description: "Formação acadêmica",
    route: "/onboarding/education",
    prerequisites: ["specialties"],
  },
  {
    id: "experience",
    phase: 2,
    title: "Experiência",
    description: "Experiência profissional",
    route: "/onboarding/experience",
    prerequisites: ["education"],
  },
  {
    id: "publish",
    phase: 2,
    title: "Publicar",
    description: "Hora de brilhar!",
    route: "/onboarding/publish",
    prerequisites: ["experience"],
  },
];

export function getStepById(id: OnboardingStepId): StepDefinition | undefined {
  return ONBOARDING_STEPS.find((step) => step.id === id);
}

export function getNextStep(currentStepId: OnboardingStepId): OnboardingStepId | null {
  const currentIndex = ONBOARDING_STEPS.findIndex((step) => step.id === currentStepId);
  if (currentIndex === -1 || currentIndex === ONBOARDING_STEPS.length - 1) {
    return null;
  }

  return ONBOARDING_STEPS[currentIndex + 1]?.id ?? null;
}

export function getPreviousStep(currentStepId: OnboardingStepId): OnboardingStepId | null {
  const currentIndex = ONBOARDING_STEPS.findIndex((step) => step.id === currentStepId);
  if (currentIndex <= 0) {
    return null;
  }

  return ONBOARDING_STEPS[currentIndex - 1]?.id ?? null;
}

export function canAccessStep(
  targetStepId: OnboardingStepId,
  completedSteps: OnboardingStepId[],
): boolean {
  const step = getStepById(targetStepId);
  if (!step) {
    return false;
  }

  const completed = new Set(completedSteps);
  return step.prerequisites.every((prerequisite) => completed.has(prerequisite));
}
