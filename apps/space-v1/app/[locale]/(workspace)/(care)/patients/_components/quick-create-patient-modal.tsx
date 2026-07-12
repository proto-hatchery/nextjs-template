"use client";

import { FormProvider, useForm } from "@workspace/forms/react-hook-form";
import { createPatientAction } from "@workspace/supabase-data/actions/patients/create-patient";
import { getErrorMessage } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { queryKeys } from "@workspace/supabase-data/utils/query-keys";
import { FluriFormDialogShell } from "@workspace/brand/overlays/fluri-form-dialog-shell";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { QuickCreatePatientForm } from "./quick-create-patient-form";
import { type QuickPatientFormValues, quickPatientSchema } from "./quick-create-patient-schema";

interface QuickCreatePatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickCreatePatientModal({ open, onOpenChange }: QuickCreatePatientModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuickPatientFormValues>({
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
    },
  });

  const handleSubmit = async (data: QuickPatientFormValues) => {
    const result = quickPatientSchema.safeParse(data);
    if (!result.success) {
      toast.error("Dados inválidos");
      return;
    }
    const parsed = result.data;
    if (!parsed.phone) {
      toast.error("Telefone é obrigatório");
      return;
    }

    try {
      setIsSubmitting(true);
      unwrapActionResult(await createPatientAction({
        firstName: parsed.first_name,
        lastName: parsed.last_name,
        phone: parsed.phone,
      }));
      await queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });

      toast.success("Paciente criado com sucesso!");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao criar paciente. Tente novamente."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <FluriFormDialogShell
      open={open}
      onOpenChange={handleClose}
      title="Cadastro de paciente"
      onClose={handleClose}
      className="sm:max-w-md"
    >
      <FormProvider {...form}>
        <QuickCreatePatientForm
          onCancel={handleClose}
          onSubmit={(data) => {
            void handleSubmit(data);
          }}
          isSubmitting={isSubmitting}
        />
      </FormProvider>
    </FluriFormDialogShell>
  );
}
