import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { Check } from "lucide-react";
import { motion } from "motion/react";

import type { Plan } from "../_lib/types/plan";

interface PlanCardProps {
  plan: Plan;
  isSelected: boolean;
  isCheckingOut: boolean;
  onSelect: (planId: string) => void;
}

export function PlanCard({ plan, isSelected, isCheckingOut, onSelect }: PlanCardProps) {
  return (
    <motion.div
      onClick={() => onSelect(plan.id)}
      className={cn(
        "relative bg-white p-8 lg:p-10 cursor-pointer transition-all duration-300",
        "hover:bg-slate-50/50",
        plan.highlighted && "lg:border-x border-slate-200",
        "border border-slate-200 lg:border-none rounded-2xl lg:rounded-none",
      )}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold tracking-wide">
            {plan.badge}
          </span>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">{plan.name}</span>
          <span className="text-2xl font-normal text-slate-500">{plan.subtitle}</span>
        </div>
        <p className="text-sm text-slate-500">{plan.description}</p>
      </div>

      <div className="mb-8 pb-8 border-b border-slate-200">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-semibold text-slate-900 tracking-tight">{plan.price}</span>
          {plan.period && <span className="text-slate-500 text-lg">{plan.period}</span>}
        </div>
      </div>

      <ul className="space-y-4 mb-10">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Check size={11} strokeWidth={3} />
            </div>
            <span className="text-sm text-slate-600">{feature}</span>
          </li>
        ))}
      </ul>

      <BrandButton
        type="button"
        disabled={isCheckingOut}
        onClick={(event: React.MouseEvent) => {
          event.stopPropagation();
          onSelect(plan.id);
        }}
        variant={isSelected ? "primary" : "neutral"}
        className="w-full"
        size="large"
      >
        {isSelected ? (
          <span className="flex items-center justify-center gap-2">
            {isCheckingOut ? <Spinner className="size-4" /> : <Check size={16} />}
            Selecionado
          </span>
        ) : plan.id === "plus" ? (
          "Lista de Espera"
        ) : (
          "Começar Agora"
        )}
      </BrandButton>
    </motion.div>
  );
}
