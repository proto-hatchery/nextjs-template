"use client";

import { FormProvider, useForm, zodResolver } from "@workspace/forms/react-hook-form";
import { FluriFormDialogShell } from "@workspace/brand/overlays/fluri-form-dialog-shell";
import { useEffect } from "react";

import { EditAddressForm } from "./edit-address-form";
import { type AddressInput, addressSchema } from "./edit-address-schema";

interface EditAddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAddress?: {
    street?: string | null;
    number?: string | null;
    complement?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
  } | null;
  onSave: (address: AddressInput) => void;
}

export function EditAddressModal({
  open,
  onOpenChange,
  initialAddress,
  onSave,
}: EditAddressModalProps) {
  const form = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: initialAddress?.street ?? "",
      number: initialAddress?.number ?? "",
      complement: initialAddress?.complement ?? "",
      neighborhood: initialAddress?.neighborhood ?? "",
      city: initialAddress?.city ?? "",
      state: initialAddress?.state ?? "",
      postalCode: initialAddress?.postalCode ?? "",
      country: initialAddress?.country ?? "Brasil",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        street: initialAddress?.street ?? "",
        number: initialAddress?.number ?? "",
        complement: initialAddress?.complement ?? "",
        neighborhood: initialAddress?.neighborhood ?? "",
        city: initialAddress?.city ?? "",
        state: initialAddress?.state ?? "",
        postalCode: initialAddress?.postalCode ?? "",
        country: initialAddress?.country ?? "Brasil",
      });
    }
  }, [open, initialAddress, form]);

  const handleSave = (values: AddressInput) => {
    onSave(values);
    onOpenChange(false);
  };

  const hasPostalCode =
    initialAddress?.postalCode && String(initialAddress.postalCode).replace(/\D/g, "").length === 8;

  const showInitialAddressFields = !!(hasPostalCode ?? initialAddress?.street);

  return (
    <FluriFormDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Adicionar Endereço"
      onClose={() => onOpenChange(false)}
      className="sm:max-w-lg"
      contentClassName="max-h-[90vh] overflow-y-auto"
    >
      <FormProvider {...form}>
        <EditAddressForm
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSave}
          showInitialAddressFields={showInitialAddressFields}
        />
      </FormProvider>
    </FluriFormDialogShell>
  );
}
