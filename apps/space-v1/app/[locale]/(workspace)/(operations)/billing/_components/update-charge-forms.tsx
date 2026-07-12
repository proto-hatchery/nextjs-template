"use client";

import { FluriFieldV2Select } from "@workspace/forms/components/base/v2/fluri-field-v2-select";
import { FluriFieldV2Currency } from "@workspace/forms/components/specialized/v2/fluri-fields-v2";
import { Controller, useFormContext } from "@workspace/forms/react-hook-form";
import { getV2SelectProps } from "@workspace/forms/v2/rhf";
import { FluriFormDialogFooter } from "@workspace/brand/overlays/fluri-form-dialog-shell";

import {
  methodOptions,
  type UpdateMethodFormValues,
  type UpdateValueFormValues,
} from "./update-charge-schema";

interface UpdateMethodFormProps {
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export function UpdateMethodForm({ onCancel, onSubmit, isSubmitting }: UpdateMethodFormProps) {
  const { control } = useFormContext<UpdateMethodFormValues>();

  return (
    <form onSubmit={onSubmit} className="flex flex-col flex-1">
      <div className="px-5 py-4 space-y-5">
        <Controller
          name="method"
          control={control}
          render={({ field, fieldState }) => (
            <FluriFieldV2Select
              label="Meio de pagamento"
              options={methodOptions}
              placeholder="Selecione o meio de pagamento"
              field={getV2SelectProps({
                value: field.value,
                onValueChange: field.onChange,
                onBlur: field.onBlur,
                name: field.name,
                ref: field.ref,
                error: fieldState.error,
                ...(field.disabled !== undefined ? { disabled: field.disabled } : {}),
              })}
              fullWidth
              required
            />
          )}
        />
      </div>
      <FluriFormDialogFooter onCancel={onCancel} isSubmitting={isSubmitting} submitLabel="Salvar" />
    </form>
  );
}

interface UpdateValueFormProps {
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export function UpdateValueForm({ onCancel, onSubmit, isSubmitting }: UpdateValueFormProps) {
  const { control } = useFormContext<UpdateValueFormValues>();

  return (
    <form onSubmit={onSubmit} className="flex flex-col flex-1">
      <div className="px-5 py-4 space-y-5">
        <Controller
          name="amount"
          control={control}
          render={({ field, fieldState }) => (
            <FluriFieldV2Currency
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
              name={field.name}
              label="Valor da cobrança"
              placeholder="R$ 0,00"
              fullWidth
              errorMessage={fieldState.error?.message}
              required
              autoFocus
            />
          )}
        />
      </div>
      <FluriFormDialogFooter onCancel={onCancel} isSubmitting={isSubmitting} submitLabel="Salvar" />
    </form>
  );
}
