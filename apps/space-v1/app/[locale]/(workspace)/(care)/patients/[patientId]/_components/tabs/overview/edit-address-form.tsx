"use client";

import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";
import { FluriFieldV2Country } from "@workspace/forms/components/specialized/v2/fluri-fields-v2";
import { Controller, useFormContext } from "@workspace/forms/react-hook-form";
import {
  normalizeNullableValue,
  normalizeStringValue,
  resolveV2FieldError,
} from "@workspace/forms/v2/kernel";
import { getV2InputProps } from "@workspace/forms/v2/rhf";
import { useV2ControllerField } from "@workspace/forms/v2/rhf";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { FluriFormDialogFooter } from "@workspace/brand/overlays/fluri-form-dialog-shell";
import { Globe } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { CepFieldWithChangeButton } from "./edit-address-cep-field";
import { type AddressData, type AddressInput } from "./edit-address-schema";

interface EditAddressFormProps {
  onCancel: () => void;
  onSubmit: (data: AddressInput) => void;
  showInitialAddressFields: boolean;
}

type AddressMode = "brazilian" | "international";

export function EditAddressForm({
  onCancel,
  onSubmit,
  showInitialAddressFields,
}: EditAddressFormProps) {
  const { control, handleSubmit, setValue, clearErrors, setError, watch } =
    useFormContext<AddressInput>();
  const [showAddressFields, setShowAddressFields] = useState(showInitialAddressFields);
  const addressNumberFieldRef = useRef<HTMLInputElement>(null);
  const cepFieldRef = useRef<HTMLInputElement>(null);

  // Detect if initial data is international (has country field set and not Brasil)
  const initialCountry = watch("country");
  const [addressMode, setAddressMode] = useState<AddressMode>(() => {
    if (initialCountry && initialCountry !== "Brasil" && initialCountry !== "BR") {
      return "international";
    }
    return "brazilian";
  });

  useEffect(() => {
    if (addressMode === "international" && showInitialAddressFields) {
      setShowAddressFields(true);
    }
  }, [addressMode, showInitialAddressFields]);

  const postalCodeField = useV2ControllerField({
    control,
    name: "postalCode",
    mode: "string",
  });

  const handleAddressFound = useCallback(
    (address: AddressData) => {
      setValue("street", address.street, { shouldValidate: false });
      setValue("neighborhood", address.neighborhood, { shouldValidate: false });
      setValue("city", address.city, { shouldValidate: false });
      setValue("state", address.state, { shouldValidate: false });
      clearErrors("street");
      clearErrors("neighborhood");
      clearErrors("city");
      clearErrors("state");
      setShowAddressFields(true);
      setTimeout(() => {
        addressNumberFieldRef.current?.focus();
      }, 350);
    },
    [setValue, clearErrors],
  );

  const handleCepError = useCallback(
    (errorMessage: string) => {
      setError("postalCode", {
        type: "manual",
        message: errorMessage,
      });
    },
    [setError],
  );

  const handleChangeCep = () => {
    setValue("street", "");
    setValue("number", "");
    setValue("complement", "");
    setValue("neighborhood", "");
    setValue("city", "");
    setValue("state", "");
    setValue("postalCode", "");
    clearErrors();
    setShowAddressFields(false);
    setTimeout(() => {
      cepFieldRef.current?.focus();
    }, 100);
  };

  const handleSwitchMode = (newMode: AddressMode) => {
    setAddressMode(newMode);
    if (newMode === "international") {
      setValue("country", "BR");
      setShowAddressFields(true);
    } else {
      setValue("country", "Brasil");
      setShowAddressFields(false);
    }
    // Clear all address fields when switching
    setValue("postalCode", "");
    setValue("street", "");
    setValue("number", "");
    setValue("complement", "");
    setValue("neighborhood", "");
    setValue("city", "");
    setValue("state", "");
    clearErrors();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit(onSubmit)(e);
      }}
      className="flex min-h-0 flex-1 flex-col overflow-visible"
    >
      <div className="px-5 py-4 overflow-visible">
        <div className="p-[3px] -m-[3px] space-y-4 overflow-visible">
          {addressMode === "brazilian" ? (
            <>
              <CepFieldWithChangeButton
                value={normalizeNullableValue(
                  postalCodeField.contract.value as string | null | undefined,
                  "",
                )}
                onChange={(value) => {
                  const cepValue = normalizeStringValue(value);
                  postalCodeField.contract.onValueChange(cepValue);
                  const cleanCep = cepValue.replace(/\D/g, "");
                  if (cleanCep.length !== 8) {
                    setShowAddressFields(false);
                  }
                }}
                onBlur={postalCodeField.contract.onBlur ?? (() => undefined)}
                {...(() => {
                  const errorMessage = resolveV2FieldError(postalCodeField.contract.error);
                  return typeof errorMessage === "string"
                    ? { error: { message: errorMessage } }
                    : {};
                })()}
                showAddressFields={showAddressFields}
                onAddressFound={handleAddressFound}
                onError={handleCepError}
                onChangeCep={handleChangeCep}
                inputRef={cepFieldRef}
                helperText={
                  <span className="flex items-center justify-between">
                    <span>Digite o CEP para buscar o endereço automaticamente</span>
                    <BrandButton
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => handleSwitchMode("international")}
                      className="h-auto p-0 text-xs text-primary hover:underline"
                    >
                      <Globe className="size-3 mr-1" />
                      Endereço internacional
                    </BrandButton>
                  </span>
                }
              />
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Endereço Internacional</p>
                <BrandButton
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => handleSwitchMode("brazilian")}
                  className="h-auto p-0 text-xs text-primary hover:underline"
                >
                  Usar CEP brasileiro
                </BrandButton>
              </div>
              <Controller
                control={control}
                name="country"
                render={({ field, fieldState }) => (
                  <FluriFieldV2Country
                    value={field.value ?? "BR"}
                    onValueChange={field.onChange}
                    errorMessage={fieldState.error?.message}
                    fullWidth
                  />
                )}
              />
              <Controller
                control={control}
                name="postalCode"
                render={({ field, fieldState }) => (
                  <FluriFieldV2Input
                    label="Código Postal"
                    placeholder="Ex: 12345"
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
            </div>
          )}

          <AnimatePresence mode="wait">
            {showAddressFields && (
              <motion.div
                initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                animate={{ opacity: 1, height: "auto", transitionEnd: { overflow: "visible" } }}
                exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-4 overflow-visible"
              >
                <div className="p-[3px] -m-[3px] space-y-4 overflow-visible">
                  <div className="grid grid-cols-[1fr_auto] gap-4">
                    <Controller
                      control={control}
                      name="street"
                      render={({ field, fieldState }) => (
                        <FluriFieldV2Input
                          label="Rua (opcional)"
                          placeholder="Nome da rua"
                          field={getV2InputProps({
                            value: field.value,
                            onValueChange: (val) => {
                              field.onChange(val);
                              clearErrors("street");
                            },
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
                      name="number"
                      render={({ field, fieldState }) => (
                        <FluriFieldV2Input
                          label="Número (opcional)"
                          placeholder="123"
                          className="w-32"
                          field={getV2InputProps({
                            value: field.value,
                            onValueChange: (val) => {
                              field.onChange(val);
                              clearErrors("number");
                            },
                            onBlur: field.onBlur,
                            name: field.name,
                            ref: addressNumberFieldRef,
                            error: fieldState.error,
                          })}
                        />
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      control={control}
                      name="complement"
                      render={({ field, fieldState }) => (
                        <FluriFieldV2Input
                          label="Complemento (opcional)"
                          placeholder="Apto 101"
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
                      name="neighborhood"
                      render={({ field, fieldState }) => (
                        <FluriFieldV2Input
                          label="Bairro (opcional)"
                          placeholder="Bairro"
                          field={getV2InputProps({
                            value: field.value,
                            onValueChange: (val) => {
                              field.onChange(val);
                              clearErrors("neighborhood");
                            },
                            onBlur: field.onBlur,
                            name: field.name,
                            ref: field.ref,
                            error: fieldState.error,
                          })}
                          fullWidth
                        />
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      control={control}
                      name="city"
                      render={({ field, fieldState }) => (
                        <FluriFieldV2Input
                          label="Cidade (opcional)"
                          placeholder="Cidade"
                          field={getV2InputProps({
                            value: field.value,
                            onValueChange: (val) => {
                              field.onChange(val);
                              clearErrors("city");
                            },
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
                      name="state"
                      render={({ field, fieldState }) => (
                        <FluriFieldV2Input
                          label="Estado (opcional)"
                          placeholder={addressMode === "brazilian" ? "UF" : "Estado/Província"}
                          className="w-24"
                          maxLength={addressMode === "brazilian" ? 2 : undefined}
                          field={getV2InputProps({
                            value: field.value,
                            onValueChange: (val) => {
                              field.onChange(val);
                              clearErrors("state");
                            },
                            onBlur: field.onBlur,
                            name: field.name,
                            ref: field.ref,
                            error: fieldState.error,
                          })}
                        />
                      )}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <FluriFormDialogFooter onCancel={onCancel} submitLabel="Salvar" />
    </form>
  );
}
