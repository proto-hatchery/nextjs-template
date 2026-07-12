// Novo fluxo de onboarding:
// Fase 1 (Essencial/App Access): Identity → Professional → Payment
// Fase 2 (Completo/In-App): Configuration (serviços, horários) → Profile

export type OnboardingGroup = "profile" | "subscription";

export type OnboardingSubStep = "identity" | "professional" | "subscription";

export interface SubStep {
  id: OnboardingSubStep;
  label: string;
}

export interface StepGroup {
  id: OnboardingGroup;
  label: string;
  subSteps: SubStep[];
}

export const ONBOARDING_GROUPS: StepGroup[] = [
  {
    id: "profile",
    label: "PERFIL",
    subSteps: [
      { id: "identity", label: "Identidade" },
      { id: "professional", label: "Profissional" },
    ],
  },
  {
    id: "subscription",
    label: "ASSINATURA",
    subSteps: [{ id: "subscription", label: "Plano" }],
  },
];

export const ALL_SUB_STEPS: OnboardingSubStep[] = ["identity", "professional", "subscription"];

export const getGroupForSubStep = (subStep: OnboardingSubStep): OnboardingGroup => {
  for (const group of ONBOARDING_GROUPS) {
    if (group.subSteps.some((s) => s.id === subStep)) {
      return group.id;
    }
  }
  return "profile";
};

export const BRAZILIAN_STATES = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];
