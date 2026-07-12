"use client";

import { FormProvider, useForm, zodResolver } from "@workspace/forms/react-hook-form";
import { FluriFormDialogShell } from "@workspace/brand/overlays/fluri-form-dialog-shell";
import { useEffect } from "react";

import { EmergencyContactForm } from "./emergency-contact-form";
import { type EmergencyContact, emergencyContactSchema } from "./emergency-contact-schema";

interface EmergencyContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EmergencyContact) => void;
  initialData?: EmergencyContact | null;
  isSubmitting: boolean;
}

export function EmergencyContactDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isSubmitting,
}: EmergencyContactDialogProps) {
  const form = useForm<EmergencyContact>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: {
      name: "",
      phone: "",
      relationship: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset(initialData);
      } else {
        form.reset({ name: "", phone: "", relationship: "" });
      }
    }
  }, [open, initialData, form]);

  const title = `${initialData ? "Editar" : "Adicionar"} Contato de Emergência`;

  return (
    <FluriFormDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      onClose={() => onOpenChange(false)}
    >
      <FormProvider {...form}>
        <EmergencyContactForm
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
      </FormProvider>
    </FluriFormDialogShell>
  );
}
