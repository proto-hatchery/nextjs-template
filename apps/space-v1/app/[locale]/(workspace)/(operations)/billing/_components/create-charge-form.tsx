"use client";

import { FluriFieldV2DueDate } from "@workspace/forms/components/base/v2/fluri-field-v2-due-date";
import type { FluriFieldV2SelectOption } from "@workspace/forms/components/base/v2/fluri-field-v2-select";
import { FluriFieldV2Select } from "@workspace/forms/components/base/v2/fluri-field-v2-select";
import {
  FluriPatientFieldV2,
  type FluriPatientFieldV2Option,
} from "@workspace/forms/components/specialized/v2/fluri-patient-field-v2";
import { Controller, useFormContext } from "@workspace/forms/react-hook-form";
import { toRHFEmptyString } from "@workspace/forms/v2/kernel";
import { getV2DateProps, getV2PatientProps, getV2SelectProps } from "@workspace/forms/v2/rhf";
import { Badge } from "@workspace/ui/components/badge";
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { FloatingPointAmountInput } from "@workspace/brand/patterns/components/floating-point-money-input";
import { AlertCircle } from "lucide-react";

import {
  type ChargeFormValues,
  type CreateChargeStep,
  formatCurrencyBRL,
  parseCurrencyBRL,
} from "./create-charge-schema";

interface CreateChargeFormProps {
  currentStep: CreateChargeStep;
  patientOptions: FluriPatientFieldV2Option[];
  serviceOptions: FluriFieldV2SelectOption[];
  sessionOptions: FluriFieldV2SelectOption[];
  hasSessionOptions: boolean;
  hasServiceOptions: boolean;
  isPendingSessions: boolean;
  isFetchingSessions: boolean;
  hasDefaultCharge: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function CreateChargeForm({
  currentStep,
  patientOptions,
  serviceOptions,
  sessionOptions,
  hasSessionOptions,
  hasServiceOptions,
  isPendingSessions,
  isFetchingSessions,
  hasDefaultCharge,
  onSubmit,
}: CreateChargeFormProps) {
  const { control, watch } = useFormContext<ChargeFormValues>();

  const watchedPaymentStatus = watch("paymentStatus");

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="px-5 pt-4 pb-4">
        <div className="mb-7 flex items-center">
          <Badge variant="secondary" className="h-7 rounded-full px-3 text-xs font-medium">
            Etapa {currentStep} de 3
          </Badge>
        </div>

        <div>
          {currentStep === 1 && (
            <div className="space-y-6">
              <Controller
                name="patientId"
                control={control}
                render={({ field, fieldState }) => (
                  <FluriPatientFieldV2
                    label="Paciente *"
                    placeholder="Selecione o paciente"
                    options={patientOptions}
                    field={getV2PatientProps({
                      value: field.value,
                      onValueChange: field.onChange,
                      onBlur: field.onBlur,
                      name: field.name,
                      ref: field.ref,
                      error: fieldState.error,
                      ...(field.disabled !== undefined ? { disabled: field.disabled } : {}),
                    })}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="sessionId"
                control={control}
                render={({ field, fieldState }) => (
                  <FluriFieldV2Select
                    label="Sessão (opcional)"
                    placeholder={
                      isPendingSessions || isFetchingSessions
                        ? "Carregando sessões..."
                        : hasSessionOptions
                          ? "Vincular a uma sessão"
                          : "Nenhuma sessão encontrada"
                    }
                    options={sessionOptions}
                    field={getV2SelectProps({
                      value: field.value,
                      onValueChange: field.onChange,
                      onBlur: field.onBlur,
                      name: field.name,
                      ref: field.ref,
                      error: fieldState.error,
                      disabled: !hasSessionOptions || isPendingSessions || isFetchingSessions,
                    })}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="serviceId"
                control={control}
                render={({ field, fieldState }) => (
                  <FluriFieldV2Select
                    label="Serviço (opcional)"
                    placeholder={
                      hasServiceOptions ? "Selecione o serviço" : "Nenhum serviço encontrado"
                    }
                    options={serviceOptions}
                    field={getV2SelectProps({
                      value: field.value,
                      onValueChange: field.onChange,
                      onBlur: field.onBlur,
                      name: field.name,
                      ref: field.ref,
                      error: fieldState.error,
                      disabled: !hasServiceOptions,
                    })}
                    fullWidth
                  />
                )}
              />

              {hasDefaultCharge && (
                <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-amber-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p className="text-xs font-medium leading-relaxed">
                    Esta sessão já possui uma cobrança vinculada. Criar uma nova cobrança pode gerar
                    duplicidade.
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <Controller
                name="amount"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Valor da cobrança</FieldLabel>
                    <FloatingPointAmountInput
                      id={field.name}
                      name={field.name}
                      value={parseCurrencyBRL(field.value ?? "")}
                      onChange={(num: number) =>
                        field.onChange(num > 0 ? formatCurrencyBRL(num) : "")
                      }
                      onBlur={field.onBlur}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="dueDate"
                control={control}
                render={({ field, fieldState }) => (
                  <FluriFieldV2DueDate
                    label="Data de vencimento"
                    field={getV2DateProps({
                      name: field.name,
                      value: toRHFEmptyString(field.value),
                      onValueChange: field.onChange,
                      onBlur: field.onBlur,
                      ref: field.ref,
                      error: fieldState.error,
                      ...(field.disabled !== undefined ? { disabled: field.disabled } : {}),
                    })}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="paymentStatus"
                control={control}
                render={({ field, fieldState }) => (
                  <FluriFieldV2Select
                    label="Status inicial"
                    options={[
                      { label: "Pendente", value: "pending" },
                      { label: "Pago", value: "paid" },
                    ]}
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
                  />
                )}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="rounded-2xl border bg-muted/30 p-4 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-sm text-muted-foreground">Paciente</span>
                  <span className="text-sm font-medium text-foreground">
                    {patientOptions.find((p) => p.id === watch("patientId"))?.name ?? "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-sm text-muted-foreground">Valor</span>
                  <span className="text-sm font-medium text-foreground">
                    {watch("amount") ?? "R$ 0,00"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-sm text-muted-foreground">Vencimento</span>
                  <span className="text-sm font-medium text-foreground">
                    {watch("dueDate") ?? "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={watchedPaymentStatus === "paid" ? "secondary" : "outline"}>
                    {watchedPaymentStatus === "paid" ? "Pago" : "Pendente"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-blue-800">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Tudo pronto?</p>
                  <p className="text-xs leading-relaxed opacity-90">
                    Ao confirmar, a cobrança será registrada no histórico do paciente e no seu fluxo
                    de caixa.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
