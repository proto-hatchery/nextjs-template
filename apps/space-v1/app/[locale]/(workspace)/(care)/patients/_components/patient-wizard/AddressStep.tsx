"use client";

import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";
import {
  FluriFieldV2Cep,
  FluriFieldV2Country,
} from "@workspace/forms/components/specialized/v2/fluri-fields-v2";
import { useFormContext } from "@workspace/forms/react-hook-form";
import {
  normalizeNullableValue,
  normalizeStringValue,
  resolveV2FieldError,
} from "@workspace/forms/v2/kernel";
import { getV2InputProps, useV2ControllerField } from "@workspace/forms/v2/rhf";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { Globe } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";

interface AddressStepProps {
  hasTriedSubmit: boolean;
  showAddressFields: boolean;
  setShowAddressFields: (show: boolean) => void;
  addressNumberFieldRef: React.RefObject<HTMLInputElement | null>;
}

interface AddressData {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
}

type AddressMode = "brazilian" | "international";

export function AddressStep({
  hasTriedSubmit,
  showAddressFields,
  setShowAddressFields,
  addressNumberFieldRef,
}: AddressStepProps) {
  const { control, setValue, clearErrors, setError } = useFormContext();
  const [addressMode, setAddressMode] = useState<AddressMode>("brazilian");

  const postalCodeField = useV2ControllerField({
    control,
    name: "manual_address.postalCode",
    mode: "string",
  });
  const streetField = useV2ControllerField({
    control,
    name: "manual_address.street",
    mode: "string",
  });
  const numberField = useV2ControllerField({
    control,
    name: "manual_address.number",
    mode: "string",
  });
  const complementField = useV2ControllerField({
    control,
    name: "manual_address.complement",
    mode: "string",
  });
  const neighborhoodField = useV2ControllerField({
    control,
    name: "manual_address.neighborhood",
    mode: "string",
  });
  const cityField = useV2ControllerField({
    control,
    name: "manual_address.city",
    mode: "string",
  });
  const stateField = useV2ControllerField({
    control,
    name: "manual_address.state",
    mode: "string",
  });
  const countryField = useV2ControllerField({
    control,
    name: "manual_address.country",
    mode: "string",
  });

  const handleAddressFound = useCallback(
    (address: Omit<AddressData, "postalCode">) => {
      setValue("manual_address.street", address.street, { shouldValidate: false });
      setValue("manual_address.neighborhood", address.neighborhood, { shouldValidate: false });
      setValue("manual_address.city", address.city, { shouldValidate: false });
      setValue("manual_address.state", address.state, { shouldValidate: false });

      clearErrors("manual_address.street");
      clearErrors("manual_address.neighborhood");
      clearErrors("manual_address.city");
      clearErrors("manual_address.state");

      setShowAddressFields(true);

      setTimeout(() => {
        addressNumberFieldRef.current?.focus();
      }, 350);
    },
    [setValue, clearErrors, setShowAddressFields, addressNumberFieldRef],
  );

  const handleCepError: (error: string) => void = useCallback(
    (errorMessage: string) => {
      if (hasTriedSubmit) {
        setError("manual_address.postalCode", {
          type: "manual",
          message: errorMessage,
        });
      }
    },
    [setError, hasTriedSubmit],
  );

  const handleSwitchMode = (newMode: AddressMode) => {
    setAddressMode(newMode);
    if (newMode === "international") {
      setValue("manual_address.country", "BR");
      setShowAddressFields(true);
    } else {
      setValue("manual_address.country", "Brasil");
      setShowAddressFields(false);
    }
    // Clear all address fields when switching
    setValue("manual_address.postalCode", "");
    setValue("manual_address.street", "");
    setValue("manual_address.number", "");
    setValue("manual_address.complement", "");
    setValue("manual_address.neighborhood", "");
    setValue("manual_address.city", "");
    setValue("manual_address.state", "");
    clearErrors();
  };

  const postalCodeError = hasTriedSubmit
    ? (resolveV2FieldError(postalCodeField.contract.error) as string | undefined)
    : undefined;

  return (
    <div className="space-y-6 pt-1 animate-in fade-in-50 slide-in-from-right-4 duration-300">
      <div className="space-y-4">
        {addressMode === "brazilian" ? (
          <>
            <FluriFieldV2Cep
              label="CEP"
              placeholder="00000-000"
              value={normalizeNullableValue(
                postalCodeField.contract.value as string | null | undefined,
                "",
              )}
              onChange={(event) => {
                const cepValue = normalizeStringValue(event.target.value);
                postalCodeField.contract.onValueChange(cepValue);
                if (hasTriedSubmit && postalCodeError) {
                  clearErrors("manual_address.postalCode");
                }
                const cleanCep = cepValue.replace(/\D/g, "");
                if (cleanCep.length !== 8) {
                  setShowAddressFields(false);
                }
              }}
              onBlur={postalCodeField.contract.onBlur}
              onAddressFound={handleAddressFound}
              onError={handleCepError}
              errorMessage={postalCodeError}
              disabled={postalCodeField.contract.disabled}
              helperText={
                <span className="flex items-center justify-between">
                  <span>Digite o CEP para buscar o endereço automaticamente</span>
                  <BrandButton
                    type="button"
                    variant="link"
                    size="xs"
                    onClick={() => handleSwitchMode("international")}
                    className="h-auto p-0 text-primary hover:underline"
                  >
                    <Globe className="size-3 mr-1" />
                    Endereço internacional
                  </BrandButton>
                </span>
              }
              fullWidth
            />
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Endereço Internacional</p>
              <BrandButton
                type="button"
                variant="link"
                size="xs"
                onClick={() => handleSwitchMode("brazilian")}
                className="h-auto p-0 text-primary hover:underline"
              >
                Usar CEP brasileiro
              </BrandButton>
            </div>
            <FluriFieldV2Country
              label="País"
              value={normalizeNullableValue(
                countryField.contract.value as string | null | undefined,
                "BR",
              )}
              onValueChange={(value) => {
                countryField.contract.onValueChange(value);
              }}
              fullWidth
            />
            <FluriFieldV2Input
              label="Código Postal"
              placeholder="Ex: 12345"
              field={getV2InputProps(postalCodeField.contract)}
              fullWidth
            />
          </div>
        )}

        <AnimatePresence mode="wait">
          {showAddressFields && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-4"
            >
              <div className="grid grid-cols-[1fr_auto] gap-4">
                <FluriFieldV2Input
                  label="Rua"
                  placeholder="Nome da rua"
                  field={getV2InputProps(streetField.contract)}
                  fullWidth
                />

                <FluriFieldV2Input
                  label="Número"
                  placeholder="123"
                  inputRef={addressNumberFieldRef}
                  field={getV2InputProps(numberField.contract)}
                  containerClassName="w-32"
                  fullWidth={false}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FluriFieldV2Input
                  label="Complemento"
                  placeholder="Apto 101"
                  field={getV2InputProps(complementField.contract)}
                  fullWidth
                />

                <FluriFieldV2Input
                  label="Bairro"
                  placeholder="Bairro"
                  field={getV2InputProps(neighborhoodField.contract)}
                  fullWidth
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FluriFieldV2Input
                  label="Cidade"
                  placeholder="Cidade"
                  field={getV2InputProps(cityField.contract)}
                  fullWidth
                />

                <FluriFieldV2Input
                  label="Estado"
                  placeholder={addressMode === "brazilian" ? "UF" : "Estado/Província"}
                  maxLength={addressMode === "brazilian" ? 2 : undefined}
                  field={getV2InputProps(stateField.contract)}
                  onChange={
                    addressMode === "brazilian"
                      ? (event) => {
                          event.target.value = event.target.value.toUpperCase().slice(0, 2);
                        }
                      : undefined
                  }
                  fullWidth
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
