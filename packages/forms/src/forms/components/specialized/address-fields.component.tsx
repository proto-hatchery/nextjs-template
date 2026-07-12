"use client";

import { useState } from "react";
import { FieldGroup } from "@workspace/ui/components/field";
import { CepField } from "./cep-field.component";
import TextField from "@workspace/forms/components/base/text-field.component";
import type { AddressData, AddressFieldsProps } from "@workspace/forms/types/address.types";

export const AddressFields = ({
  value,
  onChange,
  disableUntilCepFound = true,
  cepLabel = "CEP",
  streetLabel = "Rua",
  numberLabel = "Número",
  complementLabel = "Complemento",
  neighborhoodLabel = "Bairro",
  cityLabel = "Cidade",
  stateLabel = "Estado",
  errors,
  size = "md",
  ref,
  ...props
}: AddressFieldsProps) => {
  const isControlled = value !== undefined && onChange !== undefined;
  const [internalAddressData, setInternalAddressData] = useState<AddressData>({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Brasil",
  });
  const [internalCepFound, setInternalCepFound] = useState(false);

  // Use external value when controlled, internal state when uncontrolled
  const addressData = isControlled ? value : internalAddressData;
  const cepFound = isControlled
    ? value?.postalCode?.replace(/\D/g, "").length === 8
    : internalCepFound;

  const handleCepFound = (address: AddressData) => {
    const updated = {
      ...addressData,
      ...address,
      number: addressData.number || address.number,
      complement: addressData.complement || address.complement,
    };
    if (!isControlled) {
      setInternalAddressData(updated);
      setInternalCepFound(true);
    }
    onChange?.(updated);
  };

  const handleFieldChange = (field: keyof AddressData, newValue: string) => {
    const updated = { ...addressData, [field]: newValue };
    if (!isControlled) {
      setInternalAddressData(updated);
    }
    onChange?.(updated);
  };

  const isFieldDisabled = disableUntilCepFound && !cepFound;

  return (
    <FieldGroup ref={ref} {...props}>
      <CepField
        value={addressData.postalCode}
        onChange={(cep) => {
          handleFieldChange("postalCode", cep);
          if (cep.replace(/\D/g, "").length !== 8) {
            if (!isControlled) {
              setInternalCepFound(false);
            }
          }
        }}
        onAddressFound={handleCepFound}
        onError={() => {
          if (!isControlled) {
            setInternalCepFound(false);
          }
        }}
        label={cepLabel}
        required
        size={size}
        {...(errors?.postalCode !== undefined ? { errorMessage: errors.postalCode } : {})}
      />

      <TextField
        label={streetLabel}
        placeholder="Nome da rua"
        value={addressData.street}
        onChange={(e) => handleFieldChange("street", e.target.value)}
        disabled={isFieldDisabled}
        required
        size={size}
        {...(errors?.street !== undefined ? { errorMessage: errors.street } : {})}
      />

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label={numberLabel}
          placeholder="123"
          value={addressData.number}
          onChange={(e) => handleFieldChange("number", e.target.value)}
          disabled={isFieldDisabled}
          required
          size={size}
          {...(errors?.number !== undefined ? { errorMessage: errors.number } : {})}
        />

        <TextField
          label={complementLabel}
          placeholder="Apto 101"
          value={addressData.complement || ""}
          onChange={(e) => handleFieldChange("complement", e.target.value)}
          disabled={isFieldDisabled}
          size={size}
          {...(errors?.complement !== undefined ? { errorMessage: errors.complement } : {})}
        />
      </div>

      <TextField
        label={neighborhoodLabel}
        placeholder="Bairro"
        value={addressData.neighborhood}
        onChange={(e) => handleFieldChange("neighborhood", e.target.value)}
        disabled={isFieldDisabled}
        required
        size={size}
        {...(errors?.neighborhood !== undefined ? { errorMessage: errors.neighborhood } : {})}
      />

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label={cityLabel}
          placeholder="Cidade"
          value={addressData.city}
          onChange={(e) => handleFieldChange("city", e.target.value)}
          disabled={isFieldDisabled}
          required
          size={size}
          {...(errors?.city !== undefined ? { errorMessage: errors.city } : {})}
        />

        <TextField
          label={stateLabel}
          placeholder="UF"
          value={addressData.state}
          onChange={(e) => handleFieldChange("state", e.target.value.toUpperCase().slice(0, 2))}
          disabled={isFieldDisabled}
          required
          maxLength={2}
          size={size}
          {...(errors?.state !== undefined ? { errorMessage: errors.state } : {})}
        />
      </div>
    </FieldGroup>
  );
};

export default AddressFields;
