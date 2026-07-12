"use client";

import { completeOnboardingPhaseAction } from "@workspace/supabase-data/actions/onboarding/complete-phase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { ArrowRight, CheckCircle, LayoutDashboard, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PhaseTransitionProps {
  /** Current phase that was just completed */
  completedPhase: 1 | 2 | 3;
  /** Next phase available */
  nextPhase: 2 | 3 | 4;
  /** Whether to show as modal (true) or inline (false) */
  asModal?: boolean | undefined;
  /** Callback when user chooses to continue to next phase */
  onContinueToNext?: (() => void) | undefined;
  /** Callback when user chooses to go to dashboard */
  onGoToDashboard?: (() => void) | undefined;
}

const phaseContent = {
  1: {
    title: "🎉 Parabéns! Seu cadastro está completo",
    description: "Você já pode acessar o Fluri e começar a usar a plataforma.",
    nextPhaseTitle: "Fase 2: Configuração Inicial",
    nextPhaseDescription: "Configure seus serviços e horários para começar a atender.",
    estimatedTime: "~5 minutos",
  },
  2: {
    title: "✨ Excelente! Você está pronto para começar",
    description: "Seus serviços e horários estão configurados. Você já pode cadastrar pacientes!",
    nextPhaseTitle: "Fase 3: Integrações",
    nextPhaseDescription: "Conecte seu Google Calendar e configure políticas de cancelamento.",
    estimatedTime: "~3 minutos",
  },
  3: {
    title: "🚀 Quase lá! Suas integrações estão prontas",
    description: "Agora você tem um fluxo de trabalho automatizado.",
    nextPhaseTitle: "Fase 4: Perfil Público",
    nextPhaseDescription:
      "Complete seu perfil para aparecer nas buscas e ter um site profissional.",
    estimatedTime: "~5 minutos",
  },
};

export function PhaseTransition({
  completedPhase,
  nextPhase,
  asModal = true,
  onContinueToNext,
  onGoToDashboard,
}: PhaseTransitionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(true);

  const content = phaseContent[completedPhase];

  const handleContinueToNext = async () => {
    setIsLoading(true);

    // Mark current phase as complete
    const result = await completeOnboardingPhaseAction({ phase: completedPhase });
    const deserialized = result;

    if (!deserialized.success) {
      // Error is handled by UI state
      setIsLoading(false);
      return;
    }

    if (onContinueToNext) {
      onContinueToNext();
    } else {
      // Navigate to next phase
      router.push(`/onboarding/phase-${nextPhase}`);
    }

    setIsLoading(false);
  };

  const handleGoToDashboard = async () => {
    setIsLoading(true);

    // Mark current phase as complete
    const result = await completeOnboardingPhaseAction({ phase: completedPhase });
    const deserialized = result;

    if (!deserialized.success) {
      // Error is handled by UI state
      setIsLoading(false);
      return;
    }

    if (onGoToDashboard) {
      onGoToDashboard();
    } else {
      // Navigate to dashboard
      router.push("/home");
    }

    setIsLoading(false);
  };

  // Inline version (used at end of a step page)
  if (!asModal) {
    return (
      <div className="w-full max-w-2xl mx-auto py-8">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {content.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">{content.description}</p>

          <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {content.nextPhaseTitle}
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              {content.nextPhaseDescription}
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              {content.estimatedTime}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <BrandButton
              variant="primary"
              size="large"
              onClick={() => void handleContinueToNext()}
              disabled={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continuar para Fase {nextPhase}
            </BrandButton>

            <BrandButton
              variant="secondary"
              size="large"
              onClick={() => void handleGoToDashboard()}
              disabled={isLoading}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Ir para o Dashboard
            </BrandButton>
          </div>
        </div>
      </div>
    );
  }

  // Modal version
  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <DialogTitle className="text-xl">{content.title}</DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 my-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="font-medium text-sm text-slate-900 dark:text-slate-100">
              {content.nextPhaseTitle}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            {content.nextPhaseDescription}
          </p>
          <span className="text-xs text-slate-500">{content.estimatedTime}</span>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <BrandButton
            variant="secondary"
            onClick={() => void handleGoToDashboard()}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </BrandButton>
          <BrandButton
            onClick={() => void handleContinueToNext()}
            disabled={isLoading}
            className="w-full sm:w-auto"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Continuar
          </BrandButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Simpler inline version for use at the end of a form/step
 */
export function PhaseTransitionInline({
  completedPhase,
  nextPhase,
  onContinueToNext,
  onGoToDashboard,
}: Omit<PhaseTransitionProps, "asModal">) {
  return (
    <PhaseTransition
      completedPhase={completedPhase}
      nextPhase={nextPhase}
      asModal={false}
      onContinueToNext={onContinueToNext}
      onGoToDashboard={onGoToDashboard}
    />
  );
}
