import { useEffect, useState } from "react";

import { DEFAULT_PLANS } from "../constants/plans";
import { listStripePricePlans } from "../repositories/stripe-price-plans-repository";
import {
  createCheckoutSession,
  getLoginRedirectUrl,
  requireAuthenticatedUser,
} from "../services/checkout-service";
import type { Plan } from "../types/plan";

function withStripePriceIds(
  plans: Plan[],
  dbPlans: { subscription_plan_id: string; stripe_price_id: string | null }[],
) {
  return plans.map((plan) => {
    const dbPlan = dbPlans.find((row) => row.subscription_plan_id === plan.id);
    if (dbPlan?.stripe_price_id) {
      return { ...plan, stripePriceId: dbPlan.stripe_price_id };
    }
    return plan;
  });
}

export function useSelectPlan(onSuccess: () => void) {
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState("monthly_space");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>(DEFAULT_PLANS);

  useEffect(() => {
    const run = async () => {
      try {
        const { user } = await requireAuthenticatedUser();
        if (!user) {
          window.location.href = getLoginRedirectUrl();
          return;
        }

        const dbPlans = await listStripePricePlans();
        if (dbPlans.length > 0) {
          setAvailablePlans(withStripePriceIds(DEFAULT_PLANS, dbPlans));
        }
      } catch {
        setAvailablePlans(DEFAULT_PLANS);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, []);

  const continueWithSelectedPlan = async () => {
    const selectedPlan = availablePlans.find((plan) => plan.id === selectedPlanId);
    if (!selectedPlan) {
      return;
    }

    if (selectedPlan.id === "free") {
      onSuccess();
      return;
    }

    if (!selectedPlan.stripePriceId) {
      window.alert("Plano temporariamente indisponível. Tente novamente mais tarde.");
      return;
    }

    setIsCheckingOut(true);

    try {
      const { user } = await requireAuthenticatedUser();
      if (!user) {
        window.alert("Sessão expirada. Redirecionando para login...");
        window.location.href = getLoginRedirectUrl();
        return;
      }

      const checkout = await createCheckoutSession(selectedPlan.stripePriceId);
      if (checkout.url) {
        window.location.href = checkout.url;
        return;
      }

      const message = checkout.errorMessage ?? "Erro ao criar checkout";
      if (message.includes("Unauthorized") || message.includes("401")) {
        window.alert("Sessão expirada. Redirecionando para login...");
        window.location.href = getLoginRedirectUrl();
        return;
      }

      window.alert(`Erro ao iniciar o checkout: ${message}`);
    } catch {
      window.alert("Erro ao iniciar o checkout. Tente novamente.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return {
    loading,
    isCheckingOut,
    availablePlans,
    selectedPlanId,
    setSelectedPlanId,
    continueWithSelectedPlan,
  };
}
