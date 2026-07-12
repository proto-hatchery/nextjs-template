"use client";

import { FluriFieldV2Date } from "@workspace/forms/components/base/v2/fluri-field-v2-date";
import { FluriFieldV2Select } from "@workspace/forms/components/base/v2/fluri-field-v2-select";
import { FluriFieldV2TextArea } from "@workspace/forms/components/base/v2/fluri-field-v2-textarea";
import { Controller, useFormContext } from "@workspace/forms/react-hook-form";
import { getV2DateProps, getV2SelectProps, getV2TextareaProps } from "@workspace/forms/v2/rhf";
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { FloatingPointAmountInput } from "@workspace/brand/patterns/components/floating-point-money-input";
import { ArrowDownCircle, ArrowUpCircle, Loader2, Trash2 } from "lucide-react";

import { formatAmountBRL, parseAmountBRL, type TransactionFormValues } from "./transaction-schema";

interface TransactionCategoryOption {
  id: string;
  name: string;
  type: string;
}

interface TransactionFormProps {
  step: "selection" | "form";
  setStep: (step: "selection" | "form") => void;
  categories: TransactionCategoryOption[];
  mode: "create" | "edit";
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  showDeleteConfirm?: boolean;
  onDeleteRequest?: () => void;
  onCancelDelete?: () => void;
  onConfirmDelete?: () => void;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  canDelete?: boolean;
}

export function TransactionForm({
  step,
  setStep,
  categories,
  mode,
  onSubmit,
  onCancel,
  showDeleteConfirm = false,
  onDeleteRequest,
  canDelete = false,
  isSubmitting = false,
}: TransactionFormProps) {
  const { control, setValue } = useFormContext<TransactionFormValues>();

  if (step === "form" && showDeleteConfirm) {
    return (
      <div className="flex flex-col flex-1">
        <div className="flex-1 px-5 py-4">
          <div className="rounded-2xl bg-red-50 p-6 dark:bg-red-950/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/50">
                <Trash2 className="h-5 w-5" />
              </div>
              <p className="font-semibold text-red-900 dark:text-red-100">Excluir transação?</p>
            </div>
            <p className="text-sm text-red-700 dark:text-red-200">
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === "selection" && mode === "create") {
    return (
      <div className="grid grid-cols-2 gap-4 px-5 py-8">
        <BrandButton
          type="button"
          onClick={() => {
            setValue("type", "income");
            setStep("form");
          }}
          variant="neutral"
          className="flex flex-col items-center gap-4 rounded-3xl border-2 border-transparent bg-emerald-50 p-8 transition-all hover:border-emerald-200 hover:bg-emerald-100/50 active:scale-[0.98] h-auto"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
            <ArrowUpCircle className="h-8 w-8" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-900">Receita</p>
            <p className="text-xs font-medium text-emerald-700/70">Entrada de valor</p>
          </div>
        </BrandButton>

        <BrandButton
          type="button"
          onClick={() => {
            setValue("type", "expense");
            setStep("form");
          }}
          variant="neutral"
          className="flex flex-col items-center gap-4 rounded-3xl border-2 border-transparent bg-rose-50 p-8 transition-all hover:border-rose-200 hover:bg-rose-100/50 active:scale-[0.98] h-auto"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-200">
            <ArrowDownCircle className="h-8 w-8" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-rose-900">Despesa</p>
            <p className="text-xs font-medium text-rose-700/70">Saída de valor</p>
          </div>
        </BrandButton>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto space-y-6 px-5 py-4">
        <Controller
          name="amount"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Valor</FieldLabel>
              <FloatingPointAmountInput
                id={field.name}
                name={field.name}
                value={parseAmountBRL(
                  typeof field.value === "string" ? field.value : String(field.value ?? ""),
                )}
                onChange={(num) => field.onChange(num > 0 ? formatAmountBRL(num) : "")}
                onBlur={field.onBlur}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="dateTime"
          control={control}
          render={({ field, fieldState }) => (
            <FluriFieldV2Date
              label="Data"
              field={getV2DateProps({
                name: field.name,
                value: field.value,
                onValueChange: field.onChange,
                onBlur: field.onBlur,
                ref: field.ref,
                error: fieldState.error,
              })}
              fullWidth
            />
          )}
        />

        <Controller
          name="categoryId"
          control={control}
          render={({ field, fieldState }) => (
            <FluriFieldV2Select
              label="Categoria"
              placeholder="Selecione uma categoria"
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
              field={getV2SelectProps({
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
          name="paymentMethod"
          control={control}
          render={({ field, fieldState }) => (
            <FluriFieldV2Select
              label="Método de pagamento"
              placeholder="Selecione o método"
              options={[
                { label: "Nenhum", value: "none" },
                { label: "Cartão", value: "card" },
                { label: "Dinheiro", value: "cash" },
                { label: "Pix", value: "pix" },
                { label: "Transferência", value: "bank_transfer" },
                { label: "Outro", value: "other" },
              ]}
              field={getV2SelectProps({
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
          name="notes"
          control={control}
          render={({ field, fieldState }) => (
            <FluriFieldV2TextArea
              label="Observações"
              placeholder="Notas adicionais..."
              field={getV2TextareaProps({
                name: field.name,
                value: field.value ?? "",
                onValueChange: field.onChange,
                onBlur: field.onBlur,
                ref: field.ref,
                error: fieldState.error,
              })}
              fullWidth
            />
          )}
        />
      </div>

      <div className="flex items-center justify-between gap-4 bg-background/50 px-5 py-3 backdrop-blur-sm">
        {mode === "edit" && canDelete && onDeleteRequest ? (
          <BrandButton type="button" variant="destructive" onClick={onDeleteRequest}>
            <Trash2 className="h-4 w-4" />
            Excluir transação
          </BrandButton>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2">
          <BrandButton type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </BrandButton>
          <BrandButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : mode === "edit" ? (
              "Salvar"
            ) : (
              "Criar transação"
            )}
          </BrandButton>
        </div>
      </div>
    </form>
  );
}
