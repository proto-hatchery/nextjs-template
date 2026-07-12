"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";
import { deletePatientActivityAction } from "@workspace/supabase-data/actions/patients/delete-patient-activity";
import { getPatientActivitiesAction } from "@workspace/supabase-data/actions/patients/get-patient-activities";
import { isActionError } from "@workspace/supabase-data/lib/boundary/action-error";
import {
  unwrapActionResult,
  unwrapActionResultVoid,
} from "@workspace/supabase-data/lib/boundary/unwrap-action";
import { queryKeys } from "@/compat/supabase/utils/query-keys";
import { Label } from "@workspace/ui/components/label";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { BrandButton } from "@workspace/brand/components/brand-button";
import {
  FluriDialogV2,
  FluriDialogV2Content,
  FluriDialogV2Footer,
} from "@workspace/brand/overlays/fluri-dialog-v2";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Loader2, Target, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { ActivityDetailsDialog } from "../../../../../activities/_components/activity-details-dialog";
import {
  PatientDetailCardItem,
  PatientDetailCardItemActions,
} from "../../shared/patient-detail-card-item";
import {
  PatientDetailCardEmptyState,
  PatientDetailCardErrorState,
  PatientDetailCardLoadingState,
} from "../../shared/patient-detail-card-states";
import { PatientDetailSubheader } from "../../shared/patient-detail-subheader";

export interface PatientInterventionsActivitiesSectionProps {
  patientId: string;
}

// Schema for activity data
const ActivitySchema = z.object({
  id: z.string(),
  status: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  assignedAt: z.string().nullable().optional(),
  activity: z
    .object({
      name: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

const ActivitiesResponseSchema = z.object({
  activities: z.array(ActivitySchema),
});

export function PatientInterventionsActivitiesSection({
  patientId,
}: PatientInterventionsActivitiesSectionProps) {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const [activityToDelete, setActivityToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState("");

  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);

  const {
    data: assignments,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.patients.activities(patientId),
    queryFn: async () => {
      try {
        const result = await getPatientActivitiesAction({ patientId });
        const data = unwrapActionResult(result, ActivitiesResponseSchema);
        return data.activities;
      } catch (err) {
        if (isActionError(err)) {
          throw new Error(err.message);
        }
        throw err;
      }
    },
    staleTime: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const result = await deletePatientActivityAction({ assignmentId });
      return unwrapActionResultVoid(result);
    },
    onSuccess: () => {
      toast.success("Atividade deletada com sucesso");
      setActivityToDelete(null);
      setDeleteConfirmationName("");
      void queryClient.invalidateQueries({
        queryKey: queryKeys.patients.activities(patientId),
      });
    },
    onError: (error: unknown) => {
      if (isActionError(error)) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao deletar atividade");
      }
    },
  });

  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const stringsMatch = (str1: string, str2: string): boolean => {
    return normalizeString(str1) === normalizeString(str2);
  };

  const handleDeleteConfirm = () => {
    if (activityToDelete) {
      deleteMutation.mutate(activityToDelete.id);
    }
  };

  if (isPending) {
    return (
      <section className="space-y-6">
        <PatientDetailSubheader title="Atividades Terapêuticas" />
        <PatientDetailCardLoadingState message="Carregando atividades..." />
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-6">
        <PatientDetailSubheader title="Atividades Terapêuticas" />
        <PatientDetailCardErrorState
          message="Não foi possível carregar as atividades."
          onRetry={() => void refetch()}
        />
      </section>
    );
  }

  const statusLabels: Record<string, string> = {
    sent: "Enviada",
    completed: "Concluída",
    pending: "Pendente",
    cancelled: "Cancelada",
  };

  const deleteDialogTitle = "Excluir atividade";

  return (
    <section className="space-y-6">
      <PatientDetailSubheader title="Atividades Terapêuticas">
        <BrandButton
          variant="ghost"
          size="sm"
          onClick={() => setIsCreateSheetOpen(true)}
          className="rounded-full px-4"
        >
          Atribuir atividade
        </BrandButton>
      </PatientDetailSubheader>

      {assignments.length === 0 ? (
        <PatientDetailCardEmptyState
          icon={Target}
          title="Nenhuma atividade atribuída"
          subtitle="Crie sua primeira atividade terapêutica para este paciente"
        />
      ) : (
        /* Activity list */
        <div className="space-y-3">
          {assignments.map((assignment) => {
            const activityData = assignment as { activity?: { name?: string } };
            const activityName = activityData.activity?.name ?? "Atividade desconhecida";
            const statusLabel = statusLabels[assignment.status ?? ""] ?? assignment.status;

            // Format due date
            const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
            const formattedDueDate =
              dueDate && !Number.isNaN(dueDate.getTime())
                ? format(dueDate, "dd/MM/yyyy", { locale: ptBR })
                : null;

            // Relative time since assignment
            const timeAgo = assignment.assignedAt
              ? formatDistanceToNow(new Date(assignment.assignedAt), {
                  locale: ptBR,
                  addSuffix: true,
                })
              : null;

            return (
              <PatientDetailCardItem
                key={assignment.id}
                icon={<Target className="size-5 text-muted-foreground" />}
                actions={
                  <PatientDetailCardItemActions
                    onDelete={() => {
                      const activityData = assignment as { activity?: { name?: string } };
                      const activityName = activityData.activity?.name ?? "Atividade desconhecida";
                      setActivityToDelete({ id: assignment.id, name: activityName });
                      setDeleteConfirmationName("");
                    }}
                    deleteDisabled={deleteMutation.isPending}
                    deleteAriaLabel="Deletar atividade"
                  />
                }
              >
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{activityName}</p>
                  {formattedDueDate && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      • {formattedDueDate}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statusLabel}
                  {timeAgo ? ` • ${timeAgo}` : ""}
                </p>
              </PatientDetailCardItem>
            );
          })}
        </div>
      )}

      <ActivityDetailsDialog
        open={isCreateSheetOpen}
        onOpenChange={setIsCreateSheetOpen}
        defaultPatientId={patientId}
        activity={null}
        onSuccess={() => {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.patients.activities(patientId),
          });
        }}
      />

      <FluriDialogV2
        open={!!activityToDelete}
        onOpenChange={(open) => !open && setActivityToDelete(null)}
      >
        <FluriDialogV2Content
          className="flex flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-[420px]"
          showCloseButton={false}
          title={deleteDialogTitle}
          hideTitle
        >
          <div className="grid grid-cols-[auto_1fr_auto] items-center px-4 py-2">
            <div className="flex min-w-[44px] items-center justify-start">
              <BrandButton
                variant="ghost"
                size="icon-lg"
                onClick={() => setActivityToDelete(null)}
                className="ml-1 mt-2 rounded-full bg-accent hover:bg-accent/80"
                aria-label="Voltar"
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </BrandButton>
            </div>
            <div className="flex items-center justify-center px-2">
              <div className="truncate text-center text-base font-semibold text-foreground">
                {deleteDialogTitle}
              </div>
            </div>
            <div className="flex min-w-[44px] items-center justify-end">
              <BrandButton
                variant="ghost"
                size="icon-lg"
                onClick={() => setActivityToDelete(null)}
                className="mr-1 mt-2 rounded-full bg-accent hover:bg-accent/80"
                aria-label="Fechar"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </BrandButton>
            </div>
          </div>

          <div className="px-5 py-6">
            <p className="text-sm text-muted-foreground mb-4">
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a atividade{" "}
              <span className="font-medium text-foreground">
                {activityToDelete?.name ?? "Atividade desconhecida"}
              </span>
              .
            </p>
            <div className="space-y-2">
              <Label htmlFor="confirm-delete" className="text-sm text-muted-foreground">
                Digite{" "}
                <span className="font-bold text-foreground">
                  {activityToDelete?.name ?? "Atividade desconhecida"}
                </span>{" "}
                para confirmar
              </Label>
              <FluriFieldV2Input
                id="confirm-delete"
                label="Confirmação"
                value={deleteConfirmationName}
                onValueChange={setDeleteConfirmationName}
                placeholder={activityToDelete?.name ?? "Atividade desconhecida"}
                autoComplete="off"
                className="bg-muted/50 border-none"
                fullWidth
              />
            </div>
          </div>

          {isMobile ? (
            <FluriDialogV2Footer className="px-5 pb-5 pt-2">
              <BrandButton
                variant="ghost"
                onClick={() => setActivityToDelete(null)}
                disabled={deleteMutation.isPending}
              >
                Cancelar
              </BrandButton>
              <BrandButton
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={
                  !stringsMatch(
                    deleteConfirmationName,
                    activityToDelete?.name ?? "Atividade desconhecida",
                  ) || deleteMutation.isPending
                }
              >
                {deleteMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : "Excluir"}
              </BrandButton>
            </FluriDialogV2Footer>
          ) : (
            <FluriDialogV2Footer className="grid grid-cols-3 items-center px-4 pb-2 pt-1">
              <div />
              <div />
              <div className="mr-1 mb-2 flex items-center justify-end gap-2">
                <BrandButton
                  variant="ghost"
                  onClick={() => setActivityToDelete(null)}
                  disabled={deleteMutation.isPending}
                >
                  Cancelar
                </BrandButton>
                <BrandButton
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={
                    !stringsMatch(
                      deleteConfirmationName,
                      activityToDelete?.name ?? "Atividade desconhecida",
                    ) || deleteMutation.isPending
                  }
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Excluir"
                  )}
                </BrandButton>
              </div>
            </FluriDialogV2Footer>
          )}
        </FluriDialogV2Content>
      </FluriDialogV2>
    </section>
  );
}
