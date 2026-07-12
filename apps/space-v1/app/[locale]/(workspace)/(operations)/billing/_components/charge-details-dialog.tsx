"use client";

import { FormProvider, useForm, zodResolver } from "@workspace/forms/react-hook-form";
import type { PaymentMethod } from "@workspace/supabase-data/types/entities";
import { deleteChargeAction } from "@workspace/supabase-data/actions/billing/delete-charge";
import { updateChargeMethodAction } from "@workspace/supabase-data/actions/billing/update-charge-method";
import { updateChargeStatusAction } from "@workspace/supabase-data/actions/billing/update-charge-status";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { FluriFormDialogShell } from "@workspace/brand/overlays/fluri-form-dialog-shell";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { BillingRow } from "../types/billing-row";
import { ChargeDetailsForm } from "./charge-details-form";
import {
  type ChargeDetailsFormOutput,
  type ChargeDetailsFormValues,
  chargeDetailsSchema,
  type ChargeDetailsSubmitValues,
} from "./charge-details-schema";

interface ChargeDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  charge: BillingRow | null;
  rawMethod?: string;
}

export function ChargeDetailsDialog({
  open,
  onOpenChange,
  charge,
  rawMethod = "pix",
}: ChargeDetailsDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<ChargeDetailsFormValues, unknown, ChargeDetailsFormOutput>({
    resolver: zodResolver(chargeDetailsSchema),
    defaultValues: {
      status: "pending",
      method: "pix",
    },
  });

  useEffect(() => {
    if (open && charge) {
      setShowDeleteConfirm(false);
      form.reset({
        status: charge.status,
        method: (rawMethod as PaymentMethod) || "pix",
      });
    }
  }, [open, charge, rawMethod, form]);

  const onSubmit = async (values: ChargeDetailsSubmitValues) => {
    if (!charge) return;

    try {
      setIsSubmitting(true);
      unwrapActionResult(await updateChargeStatusAction({
        chargeId: charge.id,
        status: values.status,
      }));

      unwrapActionResult(await updateChargeMethodAction({
        chargeId: charge.id,
        method: values.method,
      }));

      toast.success("Cobrança atualizada com sucesso");
      onOpenChange(false);
    } catch {
      toast.error("Erro ao atualizar cobrança");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!charge) return;
    try {
      setIsDeleting(true);
      unwrapActionResult(await deleteChargeAction({ chargeId: charge.id }));
      toast.success("Cobrança invalidada");
      onOpenChange(false);
    } catch {
      toast.error("Erro ao invalidar cobrança");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isDeleting) {
      onOpenChange(false);
    }
  };

  if (!charge) return null;

  return (
    <FluriFormDialogShell
      open={open}
      onOpenChange={handleClose}
      title="Detalhes da cobrança"
      onClose={handleClose}
      className="sm:max-w-[420px]"
    >
      <FormProvider {...form}>
        <ChargeDetailsForm
          charge={charge}
          onCancel={handleClose}
          onSubmit={(e) => {
            void form.handleSubmit(onSubmit)(e);
          }}
          onDeleteRequest={() => setShowDeleteConfirm(true)}
          isSubmitting={isSubmitting}
          showDeleteConfirm={showDeleteConfirm}
          onCancelDelete={() => setShowDeleteConfirm(false)}
          onConfirmDelete={() => {
            void handleDelete();
          }}
          isDeleting={isDeleting}
        />
      </FormProvider>
    </FluriFormDialogShell>
  );
}
