"use client";

import { FormProvider, useForm, zodResolver } from "@workspace/forms/react-hook-form";
import { FluriFormDialogShell } from "@workspace/brand/overlays/fluri-form-dialog-shell";
import { useEffect } from "react";

import { MedicalContactForm } from "./medical-contact-form";
import { type MedicalContact, medicalContactSchema } from "./medical-contact-schema";

interface MedicalContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MedicalContact) => void;
  initialData?: MedicalContact | null;
  isSubmitting: boolean;
}

export function MedicalContactDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isSubmitting,
}: MedicalContactDialogProps) {
  const form = useForm<MedicalContact>({
    resolver: zodResolver(medicalContactSchema),
    defaultValues: {
      name: "",
      phone: "",
      specialty: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset(initialData);
      } else {
        form.reset({ name: "", phone: "", specialty: "", notes: "" });
      }
    }
  }, [open, initialData, form]);

  const title = `${initialData ? "Editar" : "Adicionar"} Contato Médico`;

  return (
    <FluriFormDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      onClose={() => onOpenChange(false)}
    >
      <FormProvider {...form}>
        <MedicalContactForm
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
      </FormProvider>
    </FluriFormDialogShell>
  );
}
