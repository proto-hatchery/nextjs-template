"use client";

import { BrandButton } from "@workspace/brand/components/brand-button";
import { createCheckoutSessionAction } from "@workspace/supabase-data/actions/subscriptions/create-checkout-session";
import { cn } from "@workspace/ui/lib/utils";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const SITE_URL = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3010";

interface Plan {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  stripePriceId?: string;
  badge?: string;
  highlighted?: boolean;
  buttonText: string;
  buttonVariant: "primary" | "secondary";
}

const DEFAULT_PLANS: Plan[] = [
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
    buttonText: "Começar Agora",
    buttonVariant: "secondary",
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
    ],
    badge: "MAIS POPULAR",
    highlighted: true,
    stripePriceId: "price_1SXPQtC4qHVfQvUcy7itcdbK",
    buttonText: "Começar Teste Gratuito",
    buttonVariant: "primary",
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
    ],
    buttonText: "Lista de Espera",
    buttonVariant: "secondary",
  },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn("size-3", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn("size-4 animate-spin", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-3.64-7.14" />
    </svg>
  );
}

export default function PricingClient() {
  const router = useRouter();
  const dbPlans: Array<{ subscriptionPlanId: string; stripePriceId?: string | null }> = [];
  const isLoadingPlans = false;
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);

  // Merge DB plans with default plans
  const availablePlans = useMemo(() => {
    if (!dbPlans || dbPlans.length === 0) return DEFAULT_PLANS;

    return DEFAULT_PLANS.map((plan) => {
      const dbPlan = dbPlans.find((p) => p.subscriptionPlanId === plan.id);
      if (dbPlan?.stripePriceId) {
        return { ...plan, stripePriceId: dbPlan.stripePriceId };
      }
      return plan;
    });
  }, [dbPlans]);

  const handlePlanAction = async (plan: Plan) => {
    if (plan.id === "plus") {
      alert("Em breve! Entraremos em contato quando o plano Space+ estiver disponível.");
      return;
    }

    if (plan.id === "free") {
      router.push("/onboarding/success");
      return;
    }

    if (!plan.stripePriceId) {
      alert("Plano temporariamente indisponível. Tente novamente mais tarde.");
      return;
    }

    setIsCheckingOut(plan.id);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SPACE_URL ?? "http://localhost:3009";

      const result = await createCheckoutSessionAction({
        priceId: plan.stripePriceId,
        successUrl: `${baseUrl}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${baseUrl}/pricing`,
      });

      if (result.success && result.data.url) {
        window.location.href = result.data.url;
      } else {
        const errorMessage = result.success ? "Erro ao criar checkout" : result.error.message;
        if (errorMessage.includes("Unauthorized") || errorMessage.includes("401")) {
          alert("Sessão expirada. Redirecionando para login...");
          window.location.href = `${SITE_URL}/login?redirect_to=/pricing`;
        } else {
          alert(`Erro ao iniciar o checkout: ${errorMessage}`);
        }
        setIsCheckingOut(null);
      }
    } catch (ignoreError) {
      alert("Erro ao iniciar o checkout. Tente novamente.");
      setIsCheckingOut(null);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h1 className="text-4xl sm:text-5xl font-semibold text-slate-900 mb-4 tracking-tight">
            Investimento Simples
          </h1>
          <p className="text-slate-500 font-light text-lg max-w-xl mx-auto">
            Sem taxas escondidas. Apenas o necessário para você crescer.
          </p>
          {isLoadingPlans && <p className="mt-3 text-xs text-slate-400">Atualizando planos...</p>}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-0 mb-12">
          {availablePlans.map((plan) => {
            const isCheckingOutThisPlan = isCheckingOut === plan.id;

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative bg-white p-8 lg:p-10 transition-all duration-300",
                  "border border-slate-200 rounded-2xl lg:rounded-none",
                  plan.highlighted && "lg:border-x lg:border-y-0 lg:rounded-none",
                  plan.highlighted ? "bg-gray-50" : "hover:bg-slate-50/50",
                )}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-widest border border-border/50">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-2xl font-bold text-slate-900 tracking-tight">
                      {plan.name}
                    </span>
                    <span className="text-2xl font-normal text-slate-500">{plan.subtitle}</span>
                  </div>
                  <p className="text-sm text-slate-500">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-8 pb-8 border-b border-slate-200">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-semibold text-slate-900 tracking-tight">
                      {plan.price}
                    </span>
                    {plan.period && <span className="text-slate-500 text-lg">{plan.period}</span>}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                        <CheckIcon />
                      </div>
                      <span className="text-sm text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <BrandButton
                  type="button"
                  onClick={() => void handlePlanAction(plan)}
                  disabled={isCheckingOut !== null}
                  variant={plan.buttonVariant === "primary" ? "primary" : "neutral"}
                  size="large"
                  className={cn(
                    "w-full",
                    isCheckingOut !== null &&
                      !isCheckingOutThisPlan &&
                      "opacity-50 cursor-not-allowed",
                  )}
                >
                  {isCheckingOutThisPlan ? (
                    <span className="flex items-center justify-center gap-2">
                      <SpinnerIcon />
                      Redirecionando...
                    </span>
                  ) : (
                    plan.buttonText
                  )}
                </BrandButton>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-400">
          Você pode alterar seu plano a qualquer momento nas configurações.
        </p>
      </div>
    </div>
  );
}
