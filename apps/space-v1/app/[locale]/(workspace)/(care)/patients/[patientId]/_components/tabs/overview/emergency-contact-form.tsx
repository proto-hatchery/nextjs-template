"use client";

import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";
import { FluriFieldV2Select } from "@workspace/forms/components/base/v2/fluri-field-v2-select";
import { FluriFieldV2Phone } from "@workspace/forms/components/specialized/v2/fluri-fields-v2";
import { Controller, useFormContext } from "@workspace/forms/react-hook-form";
import { getV2InputProps, getV2SelectProps } from "@workspace/forms/v2/rhf";
import { FluriFormDialogFooter } from "@workspace/brand/overlays/fluri-form-dialog-shell";

import { type EmergencyContact, relationshipOptions } from "./emergency-contact-schema";

interface EmergencyContactFormProps {
  onCancel: () => void;
  isSubmitting: boolean;
  onSubmit: (data: EmergencyContact) => void;
}

export function EmergencyContactForm({
  onCancel,
  isSubmitting,
  onSubmit,
}: EmergencyContactFormProps) {
  const { control, handleSubmit } = useFormContext<EmergencyContact>();

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
          name="name"
          render={({ field, fieldState }) => (
            <FluriFieldV2Input
              label="Nome completo"
              placeholder="Ex: Maria Silva"
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
          name="phone"
          render={({ field, fieldState }) => (
            <FluriFieldV2Phone
              label="Telefone"
              placeholder="Ex: (11) 99999-9999"
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
              errorMessage={fieldState.error?.message}
              fullWidth
            />
          )}
        />

        <Controller
          control={control}
          name="relationship"
          render={({ field, fieldState }) => {
            const selectProps = getV2SelectProps({
              value: field.value,
              onValueChange: field.onChange,
              onBlur: field.onBlur,
              name: field.name,
              ref: field.ref,
              error: fieldState.error,
            });

            return (
              <FluriFieldV2Select
                label="Grau de parentesco"
                placeholder="Selecione o grau de parentesco"
                options={relationshipOptions}
                field={selectProps}
                fullWidth
              />
            );
          }}
        />
      </div>

      <FluriFormDialogFooter onCancel={onCancel} isSubmitting={isSubmitting} submitLabel="Salvar" />
    </form>
  );
}
