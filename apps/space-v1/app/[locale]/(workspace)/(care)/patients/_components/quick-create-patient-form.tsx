"use client";

import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";
import { FluriFieldV2Phone } from "@workspace/forms/components/specialized/v2/fluri-fields-v2";
import { useFormContext } from "@workspace/forms/react-hook-form";
import {
  normalizeNullableValue,
  normalizeStringValue,
  resolveV2FieldError,
} from "@workspace/forms/v2/kernel";
import { getV2InputProps, useV2ControllerField } from "@workspace/forms/v2/rhf";
import {
  FluriDialogV2Description,
  FluriDialogV2Title,
} from "@workspace/brand/overlays/fluri-dialog-v2";
import { FluriFormDialogFooter } from "@workspace/brand/overlays/fluri-form-dialog-shell";

import { type QuickPatientFormValues } from "./quick-create-patient-schema";

interface QuickCreatePatientFormProps {
  onCancel: () => void;
  onSubmit: (data: QuickPatientFormValues) => void;
  isSubmitting: boolean;
}

export function QuickCreatePatientForm({
  onCancel,
  onSubmit,
  isSubmitting,
}: QuickCreatePatientFormProps) {
  const { control, handleSubmit } = useFormContext<QuickPatientFormValues>();

  const firstNameField = useV2ControllerField({
    control,
    name: "first_name",
    mode: "string",
  });

  const lastNameField = useV2ControllerField({
    control,
    name: "last_name",
    mode: "string",
  });

  const phoneField = useV2ControllerField({
    control,
    name: "phone",
    mode: "string",
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit(onSubmit)(e);
      }}
      className="flex flex-col flex-1"
    >
      <div className="px-5 pb-4 pt-2">
        <FluriDialogV2Title>Novo Paciente (Rápido)</FluriDialogV2Title>
        <FluriDialogV2Description>
          Adicione nome e telefone rapidamente. Você poderá completar os dados depois.
        </FluriDialogV2Description>
      </div>

      <div className="space-y-4 px-5 pb-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FluriFieldV2Input
            label="Nome"
            placeholder="Ex: Maria Luiza"
            required
            autoFocus
            field={getV2InputProps(firstNameField.contract)}
            fullWidth
          />
          <FluriFieldV2Input
            label="Sobrenome"
            placeholder="Ex: Silva Santos"
            field={getV2InputProps(lastNameField.contract)}
            fullWidth
          />
        </div>

        <FluriFieldV2Phone
          label="Telefone"
          required
          value={normalizeNullableValue(phoneField.contract.value as string | null | undefined, "")}
          onChange={(event) =>
            phoneField.contract.onValueChange(normalizeStringValue(event.target.value))
          }
          onBlur={phoneField.contract.onBlur}
          errorMessage={resolveV2FieldError(phoneField.contract.error) as string | undefined}
          fullWidth
        />
      </div>

      <FluriFormDialogFooter
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        submitLabel="Criar Paciente"
      />
    </form>
  );
}
