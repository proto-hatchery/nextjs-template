"use client";

import { FluriFieldV2Select } from "@workspace/forms/components/base/v2/fluri-field-v2-select";
import { Controller, useFormContext } from "@workspace/forms/react-hook-form";
import { getV2SelectProps } from "@workspace/forms/v2/rhf";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { FluriFormDialogFooter } from "@workspace/brand/overlays/fluri-form-dialog-shell";
import { UserAvatar } from "@workspace/brand/patterns/user-avatar";
import { Loader2, Trash2 } from "lucide-react";

import { type BillingRow } from "../types/billing-row";
import {
  type ChargeDetailsFormValues,
  methodOptions,
  statusOptions,
} from "./charge-details-schema";

interface ChargeDetailsFormProps {
  charge: BillingRow;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onDeleteRequest: () => void;
  isSubmitting: boolean;
  showDeleteConfirm: boolean;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  isDeleting: boolean;
}

export function ChargeDetailsForm({
  charge,
  onCancel,
  onSubmit,
  onDeleteRequest,
  isSubmitting,
  showDeleteConfirm,
  onCancelDelete,
  onConfirmDelete,
  isDeleting,
}: ChargeDetailsFormProps) {
  const { control } = useFormContext<ChargeDetailsFormValues>();

  if (showDeleteConfirm) {
    return (
      <div className="flex flex-col flex-1">
        <div className="flex-1 px-5 py-4">
          <div className="rounded-2xl bg-red-50 p-6 dark:bg-red-950/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/50">
                <Trash2 className="h-5 w-5" />
              </div>
              <p className="font-semibold text-red-900 dark:text-red-100">Invalidar cobrança?</p>
            </div>
            <p className="text-sm text-red-700 dark:text-red-200">
              Isso marcará a cobrança como cancelada para que ela não siga no fluxo de cobrança.
            </p>
          </div>
        </div>
        <FluriFormDialogFooter
          onCancel={onCancelDelete}
          onSubmit={onConfirmDelete}
          cancelLabel="Voltar"
          submitLabel="Invalidar"
          isSubmitting={isDeleting}
          className="border-t"
        />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col flex-1">
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <div className="rounded-2xl bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <UserAvatar
              name={charge.patient}
              avatarUrl={charge.avatarUrl ?? null}
              className="h-10 w-10"
              fallbackClassName="text-sm"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{charge.patient}</p>
              <p className="text-sm text-muted-foreground">{charge.services}</p>
            </div>
          </div>
        </div>

        <Controller
          name="status"
          control={control}
          render={({ field, fieldState }) => (
            <FluriFieldV2Select
              label="Status do pagamento"
              options={statusOptions}
              placeholder="Selecione o status"
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

      <div className="flex items-center justify-between gap-4 bg-background/50 px-5 py-3 backdrop-blur-sm">
        <BrandButton type="button" variant="destructive" size="small" onClick={onDeleteRequest}>
          <Trash2 className="h-4 w-4 mr-2" />
          Invalidar cobrança
        </BrandButton>
        <div className="flex items-center gap-2">
          <BrandButton
            type="button"
            variant="ghost"
            size="small"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </BrandButton>
          <BrandButton type="submit" size="small" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </BrandButton>
        </div>
      </div>
    </form>
  );
}
