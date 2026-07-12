"use client";

import { FormProvider, useForm } from "@workspace/forms/react-hook-form";
import { createPatientAction } from "@workspace/supabase-data/actions/patients/create-patient";
import { sendPatientInviteAction } from "@workspace/supabase-data/actions/patients/manage-patient-invites";
import { getErrorMessage } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { queryKeys } from "@workspace/supabase-data/utils/query-keys";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { FluriFormDialogShell } from "@workspace/brand/overlays/fluri-form-dialog-shell";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { InvitePatientForm } from "./invite-patient-form";
import { type InvitePatientFormValues, invitePatientSchema } from "./invite-patient-schema";

interface InvitePatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ModalState = "form" | "loading" | "success";

export function InvitePatientModal({ open, onOpenChange }: InvitePatientModalProps) {
  const [state, setState] = useState<ModalState>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<InvitePatientFormValues>({
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
    },
  });

  const handleSubmit = async (data: InvitePatientFormValues) => {
    const result = invitePatientSchema.safeParse(data);
    if (!result.success) {
      toast.error("Dados inválidos");
      return;
    }
    const parsed = result.data;
    if (!parsed.phone) {
      toast.error("Telefone é obrigatório");
      return;
    }

    setState("loading");
    setIsSubmitting(true);

    try {
      // 1. Create patient first
      const createdPatient = unwrapActionResult(await createPatientAction({
        firstName: data.first_name ?? "Paciente",
        lastName: data.last_name ?? "Convidado",
        phone: parsed.phone,
      }));

      const patientId = createdPatient.id;

      // 2. Send invite
      unwrapActionResult(await sendPatientInviteAction({
        patientId,
        method: "whatsapp",
      }));
      await queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });

      setState("success");
      toast.success("Convite enviado com sucesso!");
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao enviar convite. Tente novamente."));
      setState("form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (state !== "loading") {
      form.reset();
      setState("form");
      onOpenChange(false);
    }
  };

  return (
    <FluriFormDialogShell
      open={open}
      onOpenChange={handleClose}
      title="Cadastro de paciente"
      onClose={handleClose}
      className="sm:max-w-md"
    >
      {state === "form" && (
        <FormProvider {...form}>
          <InvitePatientForm
            onCancel={handleClose}
            onSubmit={(data) => {
              void handleSubmit(data);
            }}
            isSubmitting={isSubmitting}
          />
        </FormProvider>
      )}

      {state === "loading" && (
        <div className="flex flex-col items-center gap-4 py-8 animate-in fade-in-50 duration-300">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Enviando convite...</p>
        </div>
      )}

      {state === "success" && (
        <div className="flex flex-col items-center gap-4 py-8 animate-in fade-in-50 duration-300 px-5">
          <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/20">
            <Send className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold">Convite enviado!</h3>
          <p className="text-sm text-center text-muted-foreground max-w-sm">
            O paciente receberá o convite em breve. Você poderá acompanhar o status na lista de
            pacientes.
          </p>
          <BrandButton onClick={handleClose} fullWidth>
            Fechar
          </BrandButton>
        </div>
      )}
    </FluriFormDialogShell>
  );
}
