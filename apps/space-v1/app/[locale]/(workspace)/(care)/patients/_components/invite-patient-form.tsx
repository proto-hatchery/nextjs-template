"use client";

import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";
import { FluriFieldV2Phone } from "@workspace/forms/components/specialized/v2/fluri-fields-v2";
import { useFormContext } from "@workspace/forms/react-hook-form";
import { normalizeStringValue, resolveV2FieldError } from "@workspace/forms/v2/kernel";
import { getV2InputProps, useV2ControllerField } from "@workspace/forms/v2/rhf";
import {
  FluriDialogV2Description,
  FluriDialogV2Title,
} from "@workspace/brand/overlays/fluri-dialog-v2";
import { FluriFormDialogFooter } from "@workspace/brand/overlays/fluri-form-dialog-shell";

import { type InvitePatientFormValues } from "./invite-patient-schema";

interface InvitePatientFormProps {
  onCancel: () => void;
  onSubmit: (data: InvitePatientFormValues) => void;
  isSubmitting: boolean;
}

export function InvitePatientForm({ onCancel, onSubmit, isSubmitting }: InvitePatientFormProps) {
  const { control, handleSubmit } = useFormContext<InvitePatientFormValues>();

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
        <FluriDialogV2Title>Enviar Convite para Paciente</FluriDialogV2Title>
        <FluriDialogV2Description>
          Preencha o nome (opcional) e o telefone. O paciente receberá um convite para se cadastrar
          na plataforma.
        </FluriDialogV2Description>
      </div>

      <div className="space-y-4 px-5 pb-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FluriFieldV2Input
            label="Nome (Opcional)"
            placeholder="Ex: Maria Luiza"
            fullWidth
            field={getV2InputProps(firstNameField.contract)}
          />
          <FluriFieldV2Input
            label="Sobrenome (Opcional)"
            placeholder="Ex: Silva Santos"
            fullWidth
            field={getV2InputProps(lastNameField.contract)}
          />
        </div>

        <FluriFieldV2Phone
          label="Telefone"
          required
          fullWidth
          value={normalizeStringValue(phoneField.contract.value)}
          onChange={(event) =>
            phoneField.contract.onValueChange(normalizeStringValue(event.target.value))
          }
          onBlur={phoneField.contract.onBlur}
          errorMessage={resolveV2FieldError(phoneField.contract.error) as string | undefined}
          disabled={phoneField.contract.disabled}
        />
      </div>

      <FluriFormDialogFooter
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        submitLabel="Enviar Convite"
      />
    </form>
  );
}
