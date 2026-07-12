"use client";

import { FormProvider, useForm, zodResolver } from "@workspace/forms/react-hook-form";
import type { PaymentMethod } from "@workspace/supabase-data/types/entities";
import { deleteChargeAction } from "@workspace/supabase-data/actions/billing/delete-charge";
import { updateChargeMethodAction } from "@workspace/supabase-data/actions/billing/update-charge-method";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import {
  FluriFormDialogFooter,
  FluriFormDialogShell,
} from "@workspace/brand/overlays/fluri-form-dialog-shell";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { UpdateMethodForm } from "./update-charge-forms";
import { type UpdateMethodFormValues, updateMethodSchema } from "./update-charge-schema";

interface UpdateMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chargeId: string;
  currentMethod: string;
  onSuccess?: () => void;
}

export function UpdateMethodDialog({
  open,
  onOpenChange,
  chargeId,
  currentMethod,
  onSuccess,
}: UpdateMethodDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateMethodFormValues>({
    resolver: zodResolver(updateMethodSchema),
    defaultValues: {
      method: (currentMethod as PaymentMethod) || "pix",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        method: (currentMethod as PaymentMethod) || "pix",
      });
    }
  }, [open, currentMethod, form]);

  const onSubmit = async (values: UpdateMethodFormValues) => {
    try {
      setIsSubmitting(true);
      unwrapActionResult(await updateChargeMethodAction({
        chargeId,
        method: values.method,
      }));
      toast.success("Meio de pagamento atualizado");
      onSuccess?.();
      onOpenChange(false);
    } catch {
      toast.error("Erro ao atualizar meio de pagamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => !isSubmitting && onOpenChange(false);

  return (
    <FluriFormDialogShell
      open={open}
      onOpenChange={handleClose}
      title="Atualizar meio de pagamento"
      onClose={handleClose}
      className="sm:max-w-[420px]"
    >
      <FormProvider {...form}>
        <UpdateMethodForm
          onCancel={handleClose}
          onSubmit={(e) => {
            void form.handleSubmit(onSubmit)(e);
          }}
          isSubmitting={isSubmitting}
        />
      </FormProvider>
    </FluriFormDialogShell>
  );
}

interface DeleteChargeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chargeId: string;
  onSuccess?: () => void;
  onBack?: () => void;
}

export function DeleteChargeDialog({
  open,
  onOpenChange,
  chargeId,
  onSuccess,
  onBack,
}: DeleteChargeDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      unwrapActionResult(await deleteChargeAction({ chargeId }));
      toast.success("Cobrança invalidada");
      onSuccess?.();
      onOpenChange(false);
    } catch {
      toast.error("Erro ao invalidar cobrança");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => !isDeleting && onOpenChange(false);

  return (
    <FluriFormDialogShell
      open={open}
      onOpenChange={handleClose}
      title="Invalidar cobrança"
      onClose={handleClose}
      {...(onBack ? { showBackButton: true, onBack } : { showBackButton: false })}
      className="sm:max-w-[420px]"
    >
      <div className="flex flex-col flex-1">
        <div className="px-5 pt-4 pb-4">
          <p className="text-sm text-muted-foreground">
            Isso marcará a cobrança como cancelada e interromperá novas tentativas automáticas para
            a sessão vinculada.
          </p>
        </div>
        <FluriFormDialogFooter
          onCancel={handleClose}
          onSubmit={() => {
            void handleDelete();
          }}
          submitLabel="Invalidar"
          isSubmitting={isDeleting}
          className="border-t"
        />
      </div>
    </FluriFormDialogShell>
  );
}
