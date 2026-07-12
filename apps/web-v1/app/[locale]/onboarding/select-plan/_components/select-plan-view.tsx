import { Spinner } from "@workspace/ui/components/spinner";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { motion } from "motion/react";

import type { Plan } from "../_lib/types/plan";
import { PlanCard } from "./plan-card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

interface SelectPlanViewProps {
  loading: boolean;
  plans: Plan[];
  selectedPlanId: string;
  isCheckingOut: boolean;
  onSelectPlan: (id: string) => void;
  onContinue: () => void;
  onSkip: () => void;
}

export function SelectPlanView({
  loading,
  plans,
  selectedPlanId,
  isCheckingOut,
  onSelectPlan,
  onContinue,
  onSkip,
}: SelectPlanViewProps) {
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center gap-4">
        <Spinner className="size-8 text-primary" />
        <p className="text-sm text-slate-500 font-light">Carregando planos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-6xl"
      >
        <motion.div variants={itemVariants} className="text-center mb-12 lg:mb-16">
          <h1 className="text-4xl sm:text-5xl font-semibold text-slate-900 mb-4 tracking-tight">
            Investimento Simples
          </h1>
          <p className="text-slate-500 font-light text-lg max-w-xl mx-auto">
            Sem taxas escondidas. Apenas o necessário para você crescer.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-0 mb-12"
        >
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlanId === plan.id}
              isCheckingOut={isCheckingOut}
              onSelect={onSelectPlan}
            />
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col items-center gap-4">
          <BrandButton
            type="button"
            onClick={onContinue}
            disabled={isCheckingOut}
            className="w-full max-w-sm"
            size="large"
          >
            {isCheckingOut ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="size-4" />
                Redirecionando...
              </span>
            ) : (
              "Continuar"
            )}
          </BrandButton>

          <BrandButton
            type="button"
            onClick={onSkip}
            disabled={isCheckingOut}
            variant="link"
            size="xs"
            className="text-slate-500 hover:text-slate-900"
          >
            Pular por enquanto
          </BrandButton>
        </motion.div>

        <motion.p variants={itemVariants} className="text-center text-xs text-slate-400 mt-8">
          Você pode alterar seu plano a qualquer momento nas configurações.
        </motion.p>
      </motion.div>
    </div>
  );
}
