"use client";

import type { Resolver } from "@workspace/forms/react-hook-form";
import { FormProvider, useForm, zodResolver } from "@workspace/forms/react-hook-form";
import { FluriFormDialogShell } from "@workspace/brand/overlays/fluri-form-dialog-shell";
import { useEffect } from "react";

import { PatientTestForm } from "./patient-test-form";
import { type PatientTestFormValues, patientTestSchema } from "./patient-test-schema";

interface PatientTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PatientTestFormValues) => void;
  initialData?: PatientTestFormValues | null;
  isSubmitting: boolean;
}

export function PatientTestDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isSubmitting,
}: PatientTestDialogProps) {
  const getTodayDateInputValue = () => new Date().toISOString().split("T")[0] ?? "";

  const form = useForm<PatientTestFormValues>({
    resolver: zodResolver(patientTestSchema) as Resolver<PatientTestFormValues>,
    defaultValues: {
      test_name: "",
      applied_at: getTodayDateInputValue(),
      test_type: "psychological",
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          test_name: initialData.test_name,
          applied_at: initialData.applied_at
            ? (new Date(initialData.applied_at).toISOString().split("T")[0] ?? "")
            : getTodayDateInputValue(),
          test_type: initialData.test_type || "psychological",
        });
      } else {
        form.reset({
          test_name: "",
          applied_at: getTodayDateInputValue(),
          test_type: "psychological",
        });
      }
    }
  }, [open, initialData, form]);

  const title = `${initialData ? "Editar" : "Registrar"} Teste`;

  return (
    <FluriFormDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      onClose={() => onOpenChange(false)}
    >
      <FormProvider {...form}>
        <PatientTestForm
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
      </FormProvider>
    </FluriFormDialogShell>
  );
}
