"use client";

import { updatePatientAction } from "@workspace/supabase-data/actions/patients/update-patient";
import { usePatientWithContacts } from "@workspace/supabase-data/hooks/patients";
import { getErrorMessage } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { queryKeys } from "@workspace/supabase-data/utils/query-keys";
import { safeLogger } from "@workspace/supabase-data/utils/safe-logger";
import { formatPhoneForDisplay } from "@workspace/ui/lib/format";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDeleteSimpleDialog } from "../../shared/confirm-delete-simple-dialog";
import {
  PatientDetailCardItem,
  PatientDetailCardItemActions,
} from "../../shared/patient-detail-card-item";
import { PatientDetailCardEmptyState } from "../../shared/patient-detail-card-states";
import { PatientDetailSubheader } from "../../shared/patient-detail-subheader";
import { EmergencyContactDialog } from "./emergency-contact-dialog";
import { type EmergencyContact } from "./emergency-contact-schema";

interface PatientEmergencyContactsCardProps {
  patientId: string;
}

export function PatientEmergencyContactsCard({ patientId }: PatientEmergencyContactsCardProps) {
  const queryClient = useQueryClient();
  const { data: patientWithContacts, isPending } = usePatientWithContacts(patientId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [contactToDelete, setContactToDelete] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Use emergency contacts from the separate table (via usePatientWithContacts)
  const emergencyContacts: EmergencyContact[] =
    (patientWithContacts?.emergencyContacts as unknown as EmergencyContact[]) ?? [];

  const handleOpenDialog = (index?: number) => {
    setEditingIndex(index ?? null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingIndex(null);
  };

  const onSubmit = async (data: EmergencyContact) => {
    const operation = editingIndex !== null ? "update_emergency_contact" : "add_emergency_contact";
    try {
      setIsSaving(true);
      const updatedContacts: EmergencyContact[] =
        editingIndex !== null
          ? emergencyContacts.map((contact, idx) => (idx === editingIndex ? data : contact))
          : [...emergencyContacts, data];

      unwrapActionResult(await updatePatientAction({
        patientId,
        emergencyContacts: updatedContacts,
      }));
      await queryClient.invalidateQueries({ queryKey: queryKeys.patients.guardians(patientId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(patientId) });

      toast.success(
        editingIndex !== null
          ? "Contato de emergência atualizado"
          : "Contato de emergência adicionado",
      );
      handleCloseDialog();
    } catch (error) {
      safeLogger.error("[PatientEmergencyContactsCard] Unhandled rejection", {
        operation,
        patientId,
        error: error instanceof Error ? error.message : String(error),
      });
      toast.error(getErrorMessage(error, "Erro ao salvar contato de emergência. Tente novamente."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    const operation = "delete_emergency_contact";
    try {
      setIsSaving(true);
      const updatedContacts = emergencyContacts.filter((_, idx) => idx !== index);
      unwrapActionResult(await updatePatientAction({
        patientId,
        emergencyContacts: updatedContacts.length > 0 ? updatedContacts : [],
      }));
      await queryClient.invalidateQueries({ queryKey: queryKeys.patients.guardians(patientId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(patientId) });

      toast.success("Contato de emergência removido");
      setContactToDelete(null);
    } catch (error) {
      safeLogger.error("[PatientEmergencyContactsCard] Unhandled rejection", {
        operation,
        patientId,
        error: error instanceof Error ? error.message : String(error),
      });
      toast.error(
        getErrorMessage(error, "Erro ao remover contato de emergência. Tente novamente."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isPending) {
    return (
      <div className="space-y-4">
        <PatientDetailSubheader title="Contatos de Emergência" />
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PatientDetailSubheader title="Contatos de Emergência">
        <BrandButton variant="ghost" size="sm" family="rounded" onClick={() => handleOpenDialog()}>
          Adicionar
        </BrandButton>
      </PatientDetailSubheader>

      {emergencyContacts.length === 0 ? (
        <PatientDetailCardEmptyState
          icon={Phone}
          title="Nenhum contato de emergência cadastrado"
          subtitle="Adicione contatos para emergências e pessoas próximas"
        />
      ) : (
        <div className="space-y-3">
          {emergencyContacts.map((contact, index) => (
            <PatientDetailCardItem
              key={index}
              icon={<Phone className="size-5 text-muted-foreground" />}
              actions={
                <PatientDetailCardItemActions
                  onEdit={() => handleOpenDialog(index)}
                  onDelete={() => setContactToDelete(index)}
                  editDisabled={isSaving}
                  deleteDisabled={isSaving}
                  editAriaLabel="Editar contato de emergência"
                  deleteAriaLabel="Remover contato de emergência"
                />
              }
            >
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate text-sm font-semibold text-foreground">{contact.name}</p>
                {contact.relationship ? (
                  <span className="shrink-0 rounded-full bg-background/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {contact.relationship}
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatPhoneForDisplay(contact.phone)}
              </p>
            </PatientDetailCardItem>
          ))}
        </div>
      )}

      <EmergencyContactDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={(data) => {
          void onSubmit(data);
        }}
        {...(editingIndex !== null ? { initialData: emergencyContacts[editingIndex] ?? null } : {})}
        isSubmitting={isSaving}
      />

      <ConfirmDeleteSimpleDialog
        open={contactToDelete !== null}
        onOpenChange={(open) => !open && setContactToDelete(null)}
        title="Excluir contato de emergência"
        description="Tem certeza que deseja excluir este contato de emergência? Essa ação não pode ser desfeita."
        onConfirm={() => {
          if (contactToDelete !== null) void handleDelete(contactToDelete);
        }}
        isDeleting={isSaving}
      />
    </div>
  );
}
