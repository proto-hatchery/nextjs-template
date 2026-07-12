"use client";

import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";
import { deletePatientAction } from "@workspace/supabase-data/actions/patients/delete-patient";
import { ActionError } from "@workspace/supabase-data/lib/boundary/action-error";
import { getErrorMessage } from "@workspace/supabase-data/lib/boundary/action-error";
import { unwrapActionResultVoid } from "@workspace/supabase-data/lib/boundary/unwrap-action";
import type { PatientWithDetails } from "@workspace/supabase-data/types/entities";
import { Label } from "@workspace/ui/components/label";
import { BrandButton } from "@workspace/brand/components/brand-button";
import {
  FluriDialogV2,
  FluriDialogV2Content,
  FluriDialogV2Description,
  FluriDialogV2Footer,
  FluriDialogV2Header,
  FluriDialogV2Title,
} from "@workspace/brand/overlays/fluri-dialog-v2";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { getFirstName, stringsMatch } from "@/compat/supabase/utils/patient-helpers";

interface DeletePatientDialogProps {
  patient: PatientWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog component for confirming patient deletion with first name validation.
 * Implements soft delete with 30-day recovery period.
 */
export function DeletePatientDialog({ patient, open, onOpenChange }: DeletePatientDialogProps) {
  const router = useRouter();
  const [confirmationName, setConfirmationName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!patient) return;

    try {
      setIsDeleting(true);
      unwrapActionResultVoid(await deletePatientAction({ patientId: patient.id }));

      toast.success("Paciente excluído com sucesso", {
        description: "O paciente poderá ser recuperado nos próximos 30 dias.",
      });

      onOpenChange(false);
      setConfirmationName("");

      // Redirect to patients list after successful deletion
      router.push("/patients");
    } catch (error) {
      // ActionError provides rich error information
      if (error instanceof ActionError) {
        // Check for specific error codes if needed
        if (error.isCode((code) => code.startsWith("not_found"))) {
          toast.error("Paciente não encontrado. Ele pode já ter sido excluído.");
          return;
        }
        if (error.isRetryable) {
          toast.error(`${error.message}. Tente novamente em alguns instantes.`);
          return;
        }
      }

      toast.error(getErrorMessage(error, "Erro ao excluir paciente"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onOpenChange(false);
      setConfirmationName("");
    }
  };

  if (!patient) return null;

  const firstName = getFirstName(patient.displayName);
  const isNameValid = stringsMatch(confirmationName, firstName);

  return (
    <FluriDialogV2 open={open} onOpenChange={handleClose}>
      <FluriDialogV2Content>
        <FluriDialogV2Header>
          <FluriDialogV2Title>Excluir paciente</FluriDialogV2Title>
          <FluriDialogV2Description>
            Esta ação marcará o paciente{" "}
            <span className="font-medium text-foreground">{patient.displayName}</span> como
            excluído.
          </FluriDialogV2Description>
        </FluriDialogV2Header>

        <div className="space-y-4 py-4">
          {/* Warning about recovery period */}
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium text-foreground mb-1">Período de recuperação</p>
            <p className="text-muted-foreground">
              O paciente ficará disponível para recuperação por <strong>30 dias</strong>. Após esse
              período, os dados serão excluídos permanentemente de forma automática.
            </p>
          </div>

          {/* Confirmation input */}
          <div>
            <Label htmlFor="confirm-delete" className="mb-2 block text-muted-foreground">
              Digite <span className="font-bold text-foreground">{firstName}</span> para confirmar
            </Label>
            <FluriFieldV2Input
              id="confirm-delete"
              label="Confirmação"
              value={confirmationName}
              onValueChange={setConfirmationName}
              placeholder={firstName}
              autoComplete="off"
              className="bg-muted/50 border-none"
              disabled={isDeleting}
              fullWidth
            />
          </div>
        </div>

        <FluriDialogV2Footer>
          <BrandButton variant="neutral" onClick={handleClose} disabled={isDeleting}>
            Cancelar
          </BrandButton>
          <BrandButton
            variant="destructive"
            onClick={() => {
              void handleDelete();
            }}
            disabled={!isNameValid || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Excluindo...
              </>
            ) : (
              "Excluir paciente"
            )}
          </BrandButton>
        </FluriDialogV2Footer>
      </FluriDialogV2Content>
    </FluriDialogV2>
  );
}
