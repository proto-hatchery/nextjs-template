"use client";

import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";
import { FluriFieldV2Select } from "@workspace/forms/components/base/v2/fluri-field-v2-select";
import { FluriFieldV2Phone } from "@workspace/forms/components/specialized/v2/fluri-fields-v2";
import { useFormContext } from "@workspace/forms/react-hook-form";
import {
  normalizeNullableValue,
  normalizeStringValue,
  resolveV2FieldError,
} from "@workspace/forms/v2/kernel";
import { getV2InputProps, getV2SelectProps, useV2ControllerField } from "@workspace/forms/v2/rhf";

import { relationshipOptions } from "../../[patientId]/_components/tabs/overview/emergency-contact-schema";

interface EmergencyStepProps {
  hasTriedSubmit: boolean;
}

export function EmergencyStep({ hasTriedSubmit }: EmergencyStepProps) {
  const { control, clearErrors } = useFormContext();
  const emergencyNameField = useV2ControllerField({
    control,
    name: "emergency_contact_name",
    mode: "string",
  });
  const emergencyPhoneField = useV2ControllerField({
    control,
    name: "emergency_contact_phone",
    mode: "string",
  });
  const emergencyRelationshipField = useV2ControllerField({
    control,
    name: "emergency_contact_relationship",
    mode: "string",
  });

  const emergencyPhoneError = hasTriedSubmit
    ? (resolveV2FieldError(emergencyPhoneField.contract.error) as string | undefined)
    : undefined;

  return (
    <div className="space-y-6 pt-1 animate-in fade-in-50 slide-in-from-right-4 duration-300">
      <div className="space-y-6">
        <FluriFieldV2Input
          label="Nome do Contato"
          placeholder="Ex: João Silva"
          autoFocus
          field={getV2InputProps(emergencyNameField.contract)}
          fullWidth
        />

        <FluriFieldV2Phone
          label="Telefone"
          value={normalizeNullableValue(
            emergencyPhoneField.contract.value as string | null | undefined,
            "",
          )}
          onChange={(event) => {
            emergencyPhoneField.contract.onValueChange(normalizeStringValue(event.target.value));
            if (hasTriedSubmit && emergencyPhoneError) {
              clearErrors("emergency_contact_phone");
            }
          }}
          onBlur={() => emergencyPhoneField.contract.onBlur?.()}
          errorMessage={emergencyPhoneError}
          disabled={emergencyPhoneField.contract.disabled}
          fullWidth
        />

        <FluriFieldV2Select
          label="Grau de parentesco"
          placeholder="Selecione o grau de parentesco"
          options={relationshipOptions}
          field={getV2SelectProps(emergencyRelationshipField.contract)}
          fullWidth
        />
      </div>
    </div>
  );
}
