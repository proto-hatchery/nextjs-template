"use client";

import type { PatientClinicalData } from "@workspace/supabase-data/types/entities";
import {
  deletePatientConditionAction,
  deletePatientMedicationAction,
} from "@workspace/supabase-data/actions/patients/manage-patient-clinical-data";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { queryKeys } from "@workspace/supabase-data/utils/query-keys";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Stethoscope } from "lucide-react";
import { useMemo, useState } from "react";

import { ConfirmDeleteSimpleDialog } from "../../shared/confirm-delete-simple-dialog";
import { PatientDetailCardEmptyState } from "../../shared/patient-detail-card-states";
import { PatientDetailSubheader } from "../../shared/patient-detail-subheader";
import {
  type ConditionListItem,
  mapConditionToItem,
  mapMedicationToItem,
  pickConditionIcon,
} from "./clinical-conditions-utils";
import { ClinicalEntryDialog } from "./clinical-entry-dialog";
import { PatientClinicalConditionItem } from "./patient-clinical-condition-item";

interface PatientClinicalConditionsCardProps {
  patientId: string;
  clinicalData: PatientClinicalData | null;
  isPending?: boolean;
}

export function PatientClinicalConditionsCard({
  patientId,
  clinicalData,
  isPending,
}: PatientClinicalConditionsCardProps) {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ConditionListItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ConditionListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const items = useMemo(() => {
    if (!clinicalData) return [];
    const conditions = clinicalData.conditions.map(mapConditionToItem);
    const medications = clinicalData.medications.map(mapMedicationToItem);
    return [...conditions, ...medications];
  }, [clinicalData]);

  const handleOpenCreate = () => {
    setItemToEdit(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (item: ConditionListItem) => {
    setItemToEdit(item);
    setIsCreateOpen(true);
  };

  const handleCreateDialogChange = (open: boolean) => {
    if (!open) setItemToEdit(null);
    setIsCreateOpen(open);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete?.entityId) return;
    try {
      setIsDeleting(true);
      if (itemToDelete.kind === "condition") {
        unwrapActionResult(
          await deletePatientConditionAction({ patientId, conditionId: itemToDelete.entityId }),
        );
      } else {
        unwrapActionResult(
          await deletePatientMedicationAction({ patientId, medicationId: itemToDelete.entityId }),
        );
      }
      await queryClient.invalidateQueries({ queryKey: queryKeys.patients.clinicalData(patientId) });
    } finally {
      setIsDeleting(false);
    }
    setItemToDelete(null);
  };

  return (
    <section className="space-y-6">
      <PatientDetailSubheader title="Condições médicas e medicações" showCadastroBadge={false}>
        <BrandButton variant="ghost" size="sm" family="rounded" onClick={handleOpenCreate}>
          Adicionar
        </BrandButton>
      </PatientDetailSubheader>

      {isPending ? (
        <div className="flex min-h-[120px] items-center justify-center rounded-2xl bg-muted/20 p-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
        </div>
      ) : items.length === 0 ? (
        <PatientDetailCardEmptyState
          icon={Stethoscope}
          title="Nenhuma condição ou medicação registrada"
          subtitle="Adicione condições médicas e medicamentos para acompanhar o tratamento"
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <PatientClinicalConditionItem
              key={item.id}
              icon={pickConditionIcon(item.kind, item.badge)}
              title={item.title}
              {...(item.subtitle !== undefined ? { subtitle: item.subtitle } : {})}
              {...(item.statusLabel !== undefined ? { status: item.statusLabel } : {})}
              {...(item.meta !== undefined ? { meta: item.meta } : {})}
              {...(item.source !== undefined ? { source: item.source } : {})}
              {...(item.entityId ? { onEdit: () => handleOpenEdit(item) } : {})}
              {...(item.entityId ? { onDelete: () => setItemToDelete(item) } : {})}
              deleting={isDeleting}
            />
          ))}
        </div>
      )}

      <ClinicalEntryDialog
        open={isCreateOpen}
        onOpenChange={handleCreateDialogChange}
        patientId={patientId}
        clinicalData={clinicalData}
        editItem={itemToEdit}
      />

      <ConfirmDeleteSimpleDialog
        open={itemToDelete !== null}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title="Excluir registro"
        description={`Tem certeza que deseja excluir ${itemToDelete?.title ?? "este item"}? Esta ação não pode ser desfeita.`}
        onConfirm={() => void handleDeleteConfirm()}
        isDeleting={isDeleting}
      />
    </section>
  );
}
