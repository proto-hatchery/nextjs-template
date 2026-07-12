"use client";

import {
  OnboardingStepActions,
  OnboardingStepContainer,
  OnboardingStepHeader,
} from "@workspace/brand/onboarding";
import { Calendar, Clock, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function ConfigurationPageClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleBack = () => {
    router.push("/onboarding/professional");
  };

  const handleContinue = () => {
    startTransition(() => {
      router.push("/onboarding/subscription");
    });
  };

  return (
    <OnboardingStepContainer maxWidthClassName="max-w-2xl" centered className="justify-start">
      <div className="flex h-full w-full flex-1 flex-col">
        <div className="pt-6">
          <OnboardingStepHeader
            title="Quase lá!"
            description="Você completou as informações essenciais."
            centered
            className="mb-8"
            titleClassName="text-3xl"
            descriptionClassName="text-lg"
          />

          <div className="mb-10 w-full rounded-2xl bg-indigo-50 p-8 dark:bg-indigo-900/10">
            <h3 className="mb-6 text-lg font-semibold text-indigo-900 dark:text-indigo-200">
              O que você poderá configurar em seguida:
            </h3>

            <div className="grid gap-6 sm:grid-cols-3">
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-full bg-white p-3 shadow-sm dark:bg-slate-800">
                  <Clock className="size-6 text-indigo-500" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-slate-900 dark:text-slate-100">Disponibilidade</p>
                  <p className="text-sm text-slate-500">Defina seus horários</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="rounded-full bg-white p-3 shadow-sm dark:bg-slate-800">
                  <DollarSign className="size-6 text-indigo-500" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-slate-900 dark:text-slate-100">Serviços</p>
                  <p className="text-sm text-slate-500">Tipos de atendimento</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="rounded-full bg-white p-3 shadow-sm dark:bg-slate-800">
                  <Calendar className="size-6 text-indigo-500" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-slate-900 dark:text-slate-100">Agenda Google</p>
                  <p className="text-sm text-slate-500">Sincronização</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-auto border-t border-slate-200/80 pt-6">
          <OnboardingStepActions
            onBack={handleBack}
            onContinue={handleContinue}
            continueLabel="Ir para o último passo"
            continuePendingLabel="Carregando..."
            isPending={isPending}
            className="justify-center pt-0"
          />
        </footer>
      </div>
    </OnboardingStepContainer>
  );
}
