"use client";

import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";
import { FluriFieldV2RadioGroup } from "@workspace/forms/components/base/v2/fluri-field-v2-radio-group";
import { Controller, useFormContext } from "@workspace/forms/react-hook-form";
import { getV2InputProps, getV2RadioGroupProps } from "@workspace/forms/v2/rhf";
import { FluriFormDialogFooter } from "@workspace/brand/overlays/fluri-form-dialog-shell";
import { motion } from "motion/react";

import { type ClinicalEntryFormValues } from "./clinical-entry-schema";

interface ClinicalEntryFormProps {
  selectedKind: "condition" | "medication";
  onCancel: () => void;
  onSubmit: (data: ClinicalEntryFormValues) => void;
  isSaving: boolean;
}

export function ClinicalEntryForm({
  selectedKind,
  onCancel,
  onSubmit,
  isSaving,
}: ClinicalEntryFormProps) {
  const { control, handleSubmit } = useFormContext<ClinicalEntryFormValues>();

  return (
    <motion.div
      key="form"
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 20, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <form
        id="clinical-entry-form"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit(onSubmit)(e);
        }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="px-5 py-4 space-y-6">
          {selectedKind === "condition" && (
            <Controller
              name="conditionCategory"
              control={control}
              render={({ field, fieldState }) => (
                <FluriFieldV2RadioGroup
                  label="Categoria da condição"
                  options={[
                    { value: "mental_disorder", label: "Transtorno mental" },
                    { value: "chronic_disease", label: "Doença crônica" },
                    { value: "physical_disability", label: "Deficiência física relevante" },
                  ]}
                  {...(() => {
                    const radioProps = getV2RadioGroupProps({
                      value: field.value,
                      onValueChange: field.onChange,
                      onBlur: field.onBlur,
                      name: field.name,
                      ref: field.ref,
                      error: fieldState.error,
                    });
                    return {
                      ...(radioProps.value !== undefined ? { value: radioProps.value } : {}),
                      onValueChange: radioProps.onValueChange,
                      ...(radioProps.onBlur !== undefined ? { onBlur: radioProps.onBlur } : {}),
                      ...(radioProps.errorMessage !== undefined
                        ? { errorMessage: radioProps.errorMessage }
                        : {}),
                      ...(radioProps.disabled !== undefined
                        ? { disabled: radioProps.disabled }
                        : {}),
                    };
                  })()}
                  className="grid grid-cols-1 gap-2"
                />
              )}
            />
          )}

          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <FluriFieldV2Input
                label={
                  selectedKind === "condition" ? "Nome ou breve descrição" : "Nome da medicação"
                }
                placeholder={
                  selectedKind === "condition"
                    ? "Ex.: Fibromialgia, câncer de mama, depressão..."
                    : "Ex.: Sertralina, Duloxetina..."
                }
                field={getV2InputProps({
                  value: field.value,
                  onValueChange: field.onChange,
                  onBlur: field.onBlur,
                  name: field.name,
                  ref: field.ref,
                  error: fieldState.error,
                })}
                fullWidth
                autoFocus
              />
            )}
          />

          {selectedKind === "medication" && (
            <div className="grid gap-4">
              <Controller
                name="dosage"
                control={control}
                render={({ field, fieldState }) => (
                  <FluriFieldV2Input
                    label="Dosagem (opcional)"
                    placeholder="Ex.: 50 mg"
                    field={getV2InputProps({
                      value: field.value,
                      onValueChange: field.onChange,
                      onBlur: field.onBlur,
                      name: field.name,
                      ref: field.ref,
                      error: fieldState.error,
                    })}
                    fullWidth
                  />
                )}
              />
              <Controller
                name="frequency"
                control={control}
                render={({ field, fieldState }) => (
                  <FluriFieldV2Input
                    label="Frequência (opcional)"
                    placeholder="Ex.: 1x ao dia à noite"
                    field={getV2InputProps({
                      value: field.value,
                      onValueChange: field.onChange,
                      onBlur: field.onBlur,
                      name: field.name,
                      ref: field.ref,
                      error: fieldState.error,
                    })}
                    fullWidth
                  />
                )}
              />
            </div>
          )}
        </div>

        <FluriFormDialogFooter onCancel={onCancel} isSubmitting={isSaving} submitLabel="Salvar" />
      </form>
    </motion.div>
  );
}
