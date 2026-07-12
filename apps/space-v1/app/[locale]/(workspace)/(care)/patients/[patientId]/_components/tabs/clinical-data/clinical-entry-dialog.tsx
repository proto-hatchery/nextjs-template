"use client";

import { FormProvider, useForm, zodResolver } from "@workspace/forms/react-hook-form";
import type { PatientClinicalData } from "@workspace/supabase-data/types/entities";
import {
  createPatientConditionAction,
  createPatientMedicationAction,
  updatePatientConditionAction,
  updatePatientMedicationAction,
} from "@workspace/supabase-data/actions/patients/manage-patient-clinical-data";
import { getErrorMessage } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { queryKeys } from "@workspace/supabase-data/utils/query-keys";
import { safeLogger } from "@workspace/supabase-data/utils/safe-logger";
import { FluriFormDialogShell } from "@workspace/brand/overlays/fluri-form-dialog-shell";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { ConditionListItem } from "./clinical-conditions-utils";
import { ClinicalEntryForm } from "./clinical-entry-form";
import { type ClinicalEntryFormValues, clinicalEntrySchema } from "./clinical-entry-schema";
import { ClinicalEntryTypeSelector } from "./clinical-entry-type-selector";

interface ClinicalEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  clinicalData: PatientClinicalData | null;
  /** Quando definido, abre direto no formulário de edição. */
  editItem?: ConditionListItem | null;
}

export function ClinicalEntryDialog({
  open,
  onOpenChange,
  patientId,
  clinicalData,
  editItem = null,
}: ClinicalEntryDialogProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"selection" | "form">(editItem ? "form" : "selection");
  const [selectedKind, setSelectedKind] = useState<"condition" | "medication">("condition");
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ClinicalEntryFormValues>({
    resolver: zodResolver(clinicalEntrySchema),
    defaultValues: {
      kind: "condition",
      name: "",
      conditionCategory: "mental_disorder",
      dosage: "",
      frequency: "",
    },
  });

  useEffect(() => {
    if (open && editItem) {
      setStep("form");
      setSelectedKind(editItem.kind);
      if (editItem.kind === "condition") {
        const condition = clinicalData?.conditions.find((c) => c.id === editItem.entityId);
        form.reset({
          kind: "condition",
          name: condition?.name ?? editItem.title,
          conditionCategory: (condition?.conditionType ??
            "mental_disorder") as ClinicalEntryFormValues["conditionCategory"],
        });
      } else {
        const medication = clinicalData?.medications.find((m) => m.id === editItem.entityId);
        form.reset({
          kind: "medication",
          name: medication?.name ?? editItem.title,
          dosage: medication?.dosage ?? "",
          frequency: medication?.frequency ?? "",
        });
      }
    } else if (!open) {
      setStep("selection");
      setSelectedKind("condition");
      form.reset();
    }
  }, [open, editItem, clinicalData, form]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleTypeSelect = (kind: "condition" | "medication") => {
    setSelectedKind(kind);
    form.setValue("kind", kind, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    setStep("form");
  };

  const onSubmit = async (data: ClinicalEntryFormValues) => {
    const operation = editItem?.entityId
      ? selectedKind === "condition"
        ? "update_condition"
        : "update_medication"
      : selectedKind === "condition"
        ? "create_condition"
        : "create_medication";
    try {
      setIsSaving(true);
      if (editItem?.entityId) {
        if (selectedKind === "condition") {
          unwrapActionResult(await updatePatientConditionAction({
            patientId,
            conditionId: editItem.entityId,
            input: {
              name: data.name,
              conditionType: data.conditionCategory!,
              diagnosedDate: undefined,
              icd10Code: undefined,
            },
          }));
          toast.success("Condição atualizada");
        } else {
          unwrapActionResult(await updatePatientMedicationAction({
            patientId,
            medicationId: editItem.entityId,
            input: {
              name: data.name,
              dosage: data.dosage?.trim() ? data.dosage.trim() : undefined,
              frequency: data.frequency?.trim() ? data.frequency.trim() : undefined,
              startDate: undefined,
            },
          }));
          toast.success("Medicação atualizada");
        }
      } else {
        if (selectedKind === "condition") {
          unwrapActionResult(await createPatientConditionAction({
            patientId,
            input: {
              name: data.name,
              conditionType: data.conditionCategory!,
              diagnosedDate: undefined,
              icd10Code: undefined,
            },
          }));
          toast.success("Condição adicionada");
        } else {
          unwrapActionResult(await createPatientMedicationAction({
            patientId,
            input: {
              name: data.name,
              dosage: data.dosage?.trim() ? data.dosage.trim() : undefined,
              frequency: data.frequency?.trim() ? data.frequency.trim() : undefined,
              startDate: undefined,
            },
          }));
          toast.success("Medicação adicionada");
        }
      }
      await queryClient.invalidateQueries({ queryKey: queryKeys.patients.clinicalData(patientId) });
      handleClose();
    } catch (error) {
      const message = getErrorMessage(error, "Erro ao salvar. Tente novamente.");
      safeLogger.error("[ClinicalEntryDialog] Unhandled rejection", {
        operation,
        patientId,
        errorMessage: message,
      });
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const title = editItem
    ? "Editar detalhes"
    : step === "selection"
      ? "O que você quer registrar?"
      : "Registrar detalhes";

  return (
    <FluriFormDialogShell
      open={open}
      onOpenChange={(o) => !isSaving && !o && handleClose()}
      title={title}
      showBackButton={step === "form" && !editItem}
      onBack={() => setStep("selection")}
      onClose={handleClose}
      className="sm:max-w-[420px]"
    >
      <div className="relative">
        <AnimatePresence initial={false} mode="wait">
          {step === "selection" ? (
            <ClinicalEntryTypeSelector
              onSelectCondition={() => handleTypeSelect("condition")}
              onSelectMedication={() => handleTypeSelect("medication")}
            />
          ) : (
            <FormProvider {...form}>
              <ClinicalEntryForm
                selectedKind={selectedKind}
                onCancel={handleClose}
                onSubmit={(data) => void onSubmit(data)}
                isSaving={isSaving}
              />
            </FormProvider>
          )}
        </AnimatePresence>
      </div>
    </FluriFormDialogShell>
  );
}
