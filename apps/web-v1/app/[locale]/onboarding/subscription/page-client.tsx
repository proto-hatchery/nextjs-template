"use client";

import { OnboardingStepContainer, OnboardingStepHeader } from "@workspace/brand/onboarding";
import { updateOnboardingStepAction } from "@workspace/supabase-data/actions/onboarding/flow-controller";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { PromoPriceStack } from "@workspace/brand/patterns/components/promo-price-stack";
import { Check, Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { createCheckoutSessionAction } from "@workspace/supabase-data/actions/subscriptions/create-checkout-session";

function formatFeatureLabel(feature: string) {
  if (feature === "Tudo do plano Space") {
    return (
      <>
        Tudo do plano <span className="font-bold">Space</span>
      </>
    );
  }
  if (feature === "Tudo do plano Basic") {
    return (
      <>
        Tudo do plano <span className="font-bold">Basic</span>
      </>
    );
  }
  return feature;
}

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    description: "O essencial para começar sua prática.",
    price: "Grátis",
    period: "",
    disabled: true,
    logoSrc: "/images/brand/logo/black/pricing-fluri-basic.svg",
    logoAlt: "fluribasic",
    features: [
      "Divulgação no Marketplace",
      "Agrupador de Links para Bio",
      "Site Profissional",
      "Lembrete de consulta via WhatsApp",
      "Agenda e Prontuário Simplificados",
      "Pagamentos pela plataforma",
    ],
    buttonText: "Em breve",
  },
  {
    id: "space",
    name: "Space",
    description: "Organização e rotina no dia a dia clínico.",
    price: <PromoPriceStack promoPriceCents={100} recurringPriceCents={7990} />,
    period: "",
    highlight: "Mais Popular",
    logoSrc: "/images/brand/logo/black/pricing-fluri-space.svg",
    logoAlt: "flurispace",
    features: [
      "Tudo do plano Basic",
      "Destaque no Marketplace",
      "Taxas mínimas de transação",
      "Site Profissional Completo",
    ],
    buttonText: "Começar Teste Gratuito",
  },
  {
    id: "plus",
    name: "Plus",
    description: "Para quem quer crescer com mais estrutura.",
    price: "Em breve...",
    period: "",
    disabled: true,
    logoSrc: "/images/brand/logo/black/pricing-fluri-plus.svg",
    logoAlt: "flurispace+",
    features: [
      "Tudo do plano Space",
      "Receita Saúde Automática (CPF)",
      "Geração de NFSe Automática (CNPJ)",
      "Suporte Prioritário",
    ],
    buttonText: "Em breve",
  },
];

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("space"); // Force selection of available plan
  const [isPending, setIsPending] = useState(false);

  // Record that the user has reached step 4
  useEffect(() => {
    void updateOnboardingStepAction({
      stepId: "subscription",
      isComplete: false,
      draftData: {},
    });
  }, []);

  const handleSubscribe = async () => {
    setIsPending(true);
    try {
      // The space plan is the only available plan for now
      const SPACE_PLAN_PRICE_ID = "price_1SXPQtC4qHVfQvUcy7itcdbK";

      const result = await createCheckoutSessionAction({ priceId: SPACE_PLAN_PRICE_ID });

      if (result.success && result.data.url) {
        // Hard redirect to Stripe-hosted checkout.
        // The stripe-webhook will mark onboarding_completed=true after payment.
        window.location.href = result.data.url;
      } else {
        toast.error("Erro ao iniciar pagamento. Tente novamente.");
        setIsPending(false);
      }
    } catch {
      toast.error("Erro inesperado. Tente novamente.");
      setIsPending(false);
    }
  };

  return (
    <OnboardingStepContainer maxWidthClassName="max-w-5xl">
      <OnboardingStepHeader
        title="Escolha seu plano"
        description="Comece seu teste grátis de 7 dias com o plano Space. Cancele quando quiser."
        centered
        className="mb-8"
        titleClassName="text-2xl"
        descriptionClassName="mt-1 text-base"
      />

      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            onClick={() => {
              if (!plan.disabled) setSelectedPlan(plan.id);
            }}
            className={`relative flex flex-1 flex-col p-6 transition-colors ${
              plan.disabled
                ? "cursor-not-allowed bg-slate-50/50"
                : selectedPlan === plan.id
                  ? "bg-slate-50/20 ring-1 ring-inset ring-brand-blue/10"
                  : "bg-white hover:bg-slate-50/30"
            }`}
          >
            {plan.highlight && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-blue-100 text-blue-800 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-b-md">
                {plan.highlight}
              </div>
            )}

            <div className="mb-6 mt-1">
              <div className="flex items-center gap-2 mb-2 h-8">
                <Image
                  src={plan.logoSrc}
                  alt={plan.logoAlt}
                  width={140}
                  height={32}
                  className="h-full w-auto object-contain object-left"
                />
              </div>
              <p className="text-[13px] text-slate-600 mt-1 min-h-[36px] leading-tight">
                {plan.description}
              </p>
            </div>

            <div className="mb-6">
              {typeof plan.price === "string" ? (
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-3xl font-medium tracking-tight ${plan.disabled ? "text-slate-500" : "text-slate-900"}`}
                  >
                    {plan.price}
                  </span>
                  {plan.period && <span className="text-sm text-slate-500">{plan.period}</span>}
                </div>
              ) : (
                plan.price
              )}
            </div>

            <ul className="mb-8 flex-1 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <div
                    className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${plan.disabled ? "bg-slate-300 text-white" : "bg-black text-white"}`}
                  >
                    <Check className="size-2.5" strokeWidth={4} />
                  </div>
                  <span
                    className={`text-[13px] leading-snug ${plan.disabled ? "text-slate-500" : "text-slate-700"}`}
                  >
                    {formatFeatureLabel(feature)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              {plan.disabled ? (
                <BrandButton
                  variant="secondary"
                  family="rounded"
                  size="large"
                  disabled
                  className="w-full text-[13px]"
                >
                  {plan.buttonText}
                </BrandButton>
              ) : (
                <BrandButton
                  variant="default"
                  family="rounded"
                  size="large"
                  onClick={() => {
                    void handleSubscribe();
                  }}
                  disabled={isPending}
                  className="w-full cursor-pointer text-[13px]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    plan.buttonText
                  )}
                </BrandButton>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col items-center justify-center gap-2">
        <p className="text-[11px] text-slate-500">
          Ao escolher o plano, você concorda com nossos Termos de Uso e Política de Privacidade.
        </p>
      </div>
    </OnboardingStepContainer>
  );
}
