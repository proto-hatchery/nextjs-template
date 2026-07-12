"use client";

import { BrandButton } from "@workspace/brand/components/brand-button";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

import { ErrorIcon } from "./status-icons";

// ============================================================================
// Props
// ============================================================================

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const router = useRouter();

  const handleBackToPlans = () => {
    router.push("/onboarding/select-plan");
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <ErrorIcon className="mx-auto mb-6" />

        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Algo deu errado</h1>

        <p className="text-slate-500 mb-6">{error}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <BrandButton variant="neutral" onClick={onRetry}>
              Tentar novamente
            </BrandButton>
          )}

          <BrandButton onClick={handleBackToPlans}>Voltar para planos</BrandButton>
        </div>
      </motion.div>
    </div>
  );
}
