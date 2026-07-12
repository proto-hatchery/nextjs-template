"use client";

import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";
import { Controller, useFormContext } from "@workspace/forms/react-hook-form";
import { getV2InputProps } from "@workspace/forms/v2/rhf";
import { FluriFormDialogFooter } from "@workspace/brand/overlays/fluri-form-dialog-shell";

import { type PatientTestFormValues } from "./patient-test-schema";

interface PatientTestFormProps {
  onCancel: () => void;
  isSubmitting: boolean;
  onSubmit: (data: PatientTestFormValues) => void;
}

export function PatientTestForm({ onCancel, isSubmitting, onSubmit }: PatientTestFormProps) {
  const { control, handleSubmit } = useFormContext<PatientTestFormValues>();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit(onSubmit)(e);
      }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="space-y-4 px-5 py-4">
        <Controller
          control={control}
          name="test_name"
          render={({ field, fieldState }) => (
            <FluriFieldV2Input
              label="Nome do Teste"
              placeholder="Ex: BDI-II, HTP, WISC-IV"
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
          control={control}
          name="applied_at"
          render={({ field, fieldState }) => (
            <FluriFieldV2Input
              label="Data de Aplicação"
              type="date"
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

      <FluriFormDialogFooter onCancel={onCancel} isSubmitting={isSubmitting} submitLabel="Salvar" />
    </form>
  );
}
