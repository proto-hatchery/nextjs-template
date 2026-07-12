"use client";

import { FormProvider } from "@workspace/forms/react-hook-form";
import {
  FluriFormDialogFooter,
  FluriFormDialogShell,
} from "@workspace/brand/overlays/fluri-form-dialog-shell";
import { Home, Phone, User } from "lucide-react";
import { useEffect } from "react";

import { STEPS_CONFIG } from "./full-patient-schema";
import { AddressStep } from "./patient-wizard/AddressStep";
import { EmergencyStep } from "./patient-wizard/EmergencyStep";
import { IdentificationStep } from "./patient-wizard/IdentificationStep";
import { WizardSidebar } from "./patient-wizard/WizardSidebar";
import { usePatientWizard, type UsePatientWizardResult } from "./use-patient-wizard";

const STEPS = [
  { ...STEPS_CONFIG[0], icon: User },
  { ...STEPS_CONFIG[1], icon: Home },
  { ...STEPS_CONFIG[2], icon: Phone },
] as const;

interface FullCreateWizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FullCreatePatientWizardModal({ open, onOpenChange }: FullCreateWizardModalProps) {
  const wizard: UsePatientWizardResult = usePatientWizard(() => onOpenChange(false));

  const { form, setCurrentStep, setHasTriedSubmit, setShowAddressFields } = wizard;
  const { reset } = form;

  useEffect(() => {
    if (!open) {
      reset();
      setCurrentStep(0);
      setHasTriedSubmit(false);
      setShowAddressFields(false);
    }
  }, [open, reset, setCurrentStep, setHasTriedSubmit, setShowAddressFields]);

  const handleClose = () => {
    if (!wizard.isSubmitting) {
      onOpenChange(false);
    }
  };

  const currentStepConfig = STEPS[wizard.currentStep];

  return (
    <FluriFormDialogShell
      open={open}
      onOpenChange={handleClose}
      title="Novo Paciente"
      hideHeader
      onClose={handleClose}
      className="sm:max-w-3xl h-[600px]"
      contentClassName="flex flex-col p-0"
    >
      <FormProvider {...wizard.form}>
        <div className="flex h-full min-h-0 flex-col md:flex-row">
          <WizardSidebar
            steps={[...STEPS]}
            currentStep={wizard.currentStep}
            title="Novo Paciente"
            subtitle="Cadastro completo"
          />

          <div className="flex flex-1 flex-col overflow-hidden bg-background/50">
            <div className="px-8 md:px-10 pt-8 md:pt-10 pb-4 shrink-0">
              <div className="max-w-2xl mx-auto space-y-1">
                <h3 className="text-xl font-semibold tracking-tight">{currentStepConfig?.label}</h3>
                <p className="text-muted-foreground">{currentStepConfig?.description}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 md:px-10 pt-2 pb-4 no-scrollbar">
              <form
                id="create-patient-form"
                className="max-w-2xl mx-auto"
                onSubmit={(e) => e.preventDefault()}
              >
                {wizard.currentStep === 0 && (
                  <IdentificationStep
                    hasTriedSubmit={wizard.hasTriedSubmit}
                    isMinor={wizard.isMinor}
                    onDateComplete={() =>
                      setTimeout(() => wizard.guardianFieldRef.current?.focus(), 300)
                    }
                    guardianFieldRef={wizard.guardianFieldRef}
                  />
                )}
                {wizard.currentStep === 1 && (
                  <AddressStep
                    hasTriedSubmit={wizard.hasTriedSubmit}
                    showAddressFields={wizard.showAddressFields}
                    setShowAddressFields={wizard.setShowAddressFields}
                    addressNumberFieldRef={wizard.addressNumberFieldRef}
                  />
                )}
                {wizard.currentStep === 2 && (
                  <EmergencyStep hasTriedSubmit={wizard.hasTriedSubmit} />
                )}
              </form>
            </div>

            <FluriFormDialogFooter
              onCancel={wizard.currentStep === 0 ? handleClose : wizard.handleBack}
              onSubmit={() => {
                const fn =
                  wizard.currentStep < STEPS.length - 1
                    ? wizard.handleNext
                    : wizard.handleFinalSubmit;
                void fn();
              }}
              cancelLabel={wizard.currentStep === 0 ? "Cancelar" : "Voltar"}
              submitLabel={wizard.currentStep < STEPS.length - 1 ? "Próximo" : "Finalizar Cadastro"}
              isSubmitting={wizard.isSubmitting}
              className="border-t bg-background/80 backdrop-blur-sm"
            />
          </div>
        </div>
      </FormProvider>
    </FluriFormDialogShell>
  );
}
