"use client";

import type { FluriPatientFieldV2Option as PatientOption } from "@workspace/forms/components/specialized/v2/fluri-patient-field-v2";
import { FormProvider, useForm, zodResolver } from "@workspace/forms/react-hook-form";
import { FluriFormDialogShell } from "@workspace/brand/overlays/fluri-form-dialog-shell";
import { useEffect } from "react";

import { CreateDocumentForm } from "./create-document-form";
import {
  type CreateDocumentFormValues,
  type CreateDocumentInput,
  createDocumentSchema,
} from "./create-document-schema";

interface DocumentTemplateOption {
  id: string;
  title: string;
}

interface CreateDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateDocumentInput) => void;
  patientId: string;
  patientOptions: PatientOption[];
  templates: DocumentTemplateOption[];
  isPendingTemplates: boolean;
  isSubmitting: boolean;
}

export function CreateDocumentDialog({
  open,
  onOpenChange,
  onSubmit,
  patientId,
  patientOptions,
  templates,
  isPendingTemplates,
  isSubmitting,
}: CreateDocumentDialogProps) {
  const form = useForm<CreateDocumentFormValues, unknown, CreateDocumentInput>({
    resolver: zodResolver(createDocumentSchema),
    defaultValues: {
      templateId: "",
      patientId: patientId,
      title: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        templateId: "",
        patientId: patientId,
        title: "",
      });
    }
  }, [open, patientId, form]);

  return (
    <FluriFormDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Gerar Novo Documento"
      onClose={() => onOpenChange(false)}
    >
      <FormProvider {...form}>
        <CreateDocumentForm
          patientId={patientId}
          patientOptions={patientOptions}
          templates={templates}
          isPendingTemplates={isPendingTemplates}
          isSubmitting={isSubmitting}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </FormProvider>
    </FluriFormDialogShell>
  );
}
