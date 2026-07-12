"use client";

import { updatePatientAction } from "@workspace/supabase-data/actions/patients/update-patient";
import { usePatient as usePsychologistPatientDetails } from "@workspace/supabase-data/hooks/patients";
import { getErrorMessage } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { queryKeys } from "@workspace/supabase-data/utils/query-keys";
import { safeLogger } from "@workspace/supabase-data/utils/safe-logger";
import { formatPhoneForDisplay } from "@workspace/ui/lib/format";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Stethoscope } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDeleteSimpleDialog } from "../../shared/confirm-delete-simple-dialog";
import {
  PatientDetailCardItem,
  PatientDetailCardItemActions,
} from "../../shared/patient-detail-card-item";
import { PatientDetailCardEmptyState } from "../../shared/patient-detail-card-states";
import { PatientDetailSubheader } from "../../shared/patient-detail-subheader";
import { MedicalContactDialog } from "./medical-contact-dialog";
import { type MedicalContact } from "./medical-contact-schema";

interface PatientMedicalContactsCardProps {
  patientId: string;
}

export function PatientMedicalContactsCard({ patientId }: PatientMedicalContactsCardProps) {
  const queryClient = useQueryClient();
  const { data: patient, isPending } = usePsychologistPatientDetails(patientId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [contactToDelete, setContactToDelete] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const attachedDocs = patient?.attached_documents as Record<string, unknown> | null;
  const medicalContacts: MedicalContact[] =
    (attachedDocs?.medical_contacts as MedicalContact[]) ?? [];

  const handleOpenDialog = (index?: number) => {
    setEditingIndex(index ?? null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingIndex(null);
  };

  const onSubmit = async (data: MedicalContact) => {
    const operation = editingIndex !== null ? "update_medical_contact" : "add_medical_contact";
    try {
      setIsSaving(true);
      const updatedContacts: MedicalContact[] =
        editingIndex !== null
          ? medicalContacts.map((contact, idx) => (idx === editingIndex ? data : contact))
          : [...medicalContacts, data];

      const updatedDocs = {
        ...(attachedDocs ?? {}),
        medical_contacts: updatedContacts,
      };

      unwrapActionResult(await updatePatientAction({
        patientId,
        attachedDocuments: updatedDocs,
      }));
      await queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(patientId) });

      toast.success(
        editingIndex !== null ? "Contato médico atualizado" : "Contato médico adicionado",
      );
      handleCloseDialog();
    } catch (error) {
      safeLogger.error("[PatientMedicalContactsCard] Unhandled rejection", {
        operation,
        patientId,
        error: error instanceof Error ? error.message : String(error),
      });
      toast.error(getErrorMessage(error, "Erro ao salvar contato médico. Tente novamente."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async (index: number) => {
    const operation = "delete_medical_contact";
    try {
      setIsSaving(true);
      const updatedContacts = medicalContacts.filter((_, idx) => idx !== index);
      const updatedDocs = {
        ...(attachedDocs ?? {}),
        medical_contacts: updatedContacts.length > 0 ? updatedContacts : undefined,
      };

      unwrapActionResult(await updatePatientAction({
        patientId,
        attachedDocuments: updatedDocs,
      }));
      await queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(patientId) });

      toast.success("Contato médico removido");
      setContactToDelete(null);
    } catch (error) {
      safeLogger.error("[PatientMedicalContactsCard] Unhandled rejection", {
        operation,
        patientId,
        error: error instanceof Error ? error.message : String(error),
      });
      toast.error(getErrorMessage(error, "Erro ao remover contato médico. Tente novamente."));
    } finally {
      setIsSaving(false);
    }
  };

  if (isPending) {
    return (
      <div className="space-y-4">
        <PatientDetailSubheader title="Contatos Médicos" />
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PatientDetailSubheader title="Contatos Médicos">
        <BrandButton variant="ghost" size="sm" family="rounded" onClick={() => handleOpenDialog()}>
          Adicionar
        </BrandButton>
      </PatientDetailSubheader>

      {medicalContacts.length === 0 ? (
        <PatientDetailCardEmptyState
          icon={Stethoscope}
          title="Nenhum contato médico cadastrado"
          subtitle="Adicione médicos ou profissionais de saúde que acompanham o paciente"
        />
      ) : (
        <div className="space-y-3">
          {medicalContacts.map((contact, index) => (
            <PatientDetailCardItem
              key={index}
              icon={<Stethoscope className="size-5 text-muted-foreground" />}
              actions={
                <PatientDetailCardItemActions
                  onEdit={() => handleOpenDialog(index)}
                  onDelete={() => setContactToDelete(index)}
                  deleteDisabled={isSaving}
                  editAriaLabel="Editar contato médico"
                  deleteAriaLabel="Remover contato médico"
                />
              }
            >
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate text-sm font-semibold text-foreground">{contact.name}</p>
                {contact.specialty ? (
                  <span className="shrink-0 rounded-full bg-background/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {contact.specialty}
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatPhoneForDisplay(contact.phone)}
                {contact.notes ? ` • ${contact.notes}` : ""}
              </p>
            </PatientDetailCardItem>
          ))}
        </div>
      )}

      <MedicalContactDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={(data) => {
          void onSubmit(data);
        }}
        {...(editingIndex !== null ? { initialData: medicalContacts[editingIndex] ?? null } : {})}
        isSubmitting={isSaving}
      />

      <ConfirmDeleteSimpleDialog
        open={contactToDelete !== null}
        onOpenChange={(open) => !open && setContactToDelete(null)}
        title="Excluir contato médico"
        description="Tem certeza que deseja excluir este contato médico? Essa ação não pode ser desfeita."
        onConfirm={() =>
          contactToDelete !== null ? void handleDeleteConfirm(contactToDelete) : undefined
        }
        isDeleting={isSaving}
      />
    </div>
  );
}
