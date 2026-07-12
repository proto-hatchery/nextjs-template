import type { Plan } from "../types/plan";

export const SITE_URL = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3010";
export const SPACE_URL = process.env.NEXT_PUBLIC_SPACE_URL ?? "http://localhost:3009";

export const DEFAULT_PLANS: Plan[] = [
  {
    id: "free",
    name: "fluri",
    subtitle: "basic",
    price: "Grátis",
    description: "O essencial para começar sua prática.",
    features: [
      "Divulgação no Marketplace",
      "Agrupador de Links para Bio",
      "Site Profissional",
      "Lembrete de consulta via WhatsApp",
      "Agenda e Prontuário Simplificados",
      "Pagamentos pela plataforma",
    ],
  },
  {
    id: "monthly_space",
    name: "fluri",
    subtitle: "space",
    price: "R$ 79,90",
    period: "/mês",
    description: "Organização e rotina no dia a dia clínico.",
    features: [
      "Tudo do plano Basic",
      "Destaque no Marketplace",
      "Taxas mínimas de transação",
      "Site Profissional Completo",
      "Agenda Inteligente",
      "Prontuário Completo",
      "Gestão Financeira",
    ],
    badge: "MAIS POPULAR",
    highlighted: true,
    stripePriceId: "price_1SXPQtC4qHVfQvUcy7itcdbK",
  },
  {
    id: "plus",
    name: "fluri",
    subtitle: "space+",
    price: "Em breve...",
    description: "Para quem quer crescer com mais estrutura.",
    features: [
      "Tudo do plano Space",
      "Receita Saúde Automática (CPF)",
      "Geração de NFSe Automática (CNPJ)",
      "Suporte Prioritário",
      "Múltiplos profissionais",
      "API dedicada",
    ],
  },
];
