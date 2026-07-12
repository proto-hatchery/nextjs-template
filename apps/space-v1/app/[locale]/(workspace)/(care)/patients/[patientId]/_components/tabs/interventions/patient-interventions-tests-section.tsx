"use client";

import { useQuery } from "@tanstack/react-query";
import { getPatientAssessmentsAction } from "@workspace/supabase-data/actions/patients/get-patient-assessments";
import {
  createPatientTestAction,
  deletePatientTestAction,
  updatePatientTestAction,
} from "@workspace/supabase-data/actions/patients/manage-patient-tests";
import {
  getPatientTestResultSignedUrlAction,
  uploadPatientTestResultFileAction,
} from "@workspace/supabase-data/actions/patients/manage-patient-test-files";
import { isActionError } from "@workspace/supabase-data/lib/boundary/action-error";
import {
  unwrapActionResult as unwrapTypedActionResult,
  unwrapActionResultVoid,
} from "@workspace/supabase-data/lib/boundary/unwrap-action";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { queryKeys } from "@workspace/supabase-data/utils/query-keys";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Archive, Beaker, Download, Edit2, FileUp, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { ConfirmDeleteSimpleDialog } from "../../shared/confirm-delete-simple-dialog";
import {
  PatientDetailCardEmptyState,
  PatientDetailCardErrorState,
  PatientDetailCardLoadingState,
} from "../../shared/patient-detail-card-states";
import { PatientDetailSubheader } from "../../shared/patient-detail-subheader";
import { PatientTestDialog } from "./patient-test-dialog";
import { type PatientTestFormValues } from "./patient-test-schema";

export interface PatientInterventionsTestsSectionProps {
  patientId: string;
  title?: string;
}

// Schema for assessment data
const AssessmentSchema = z.object({
  id: z.string(),
  testName: z.string().nullable().optional(),
  testType: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  appliedAt: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  fileUrl: z.string().nullable().optional(),
});

const AssessmentsResponseSchema = z.object({
  assessments: z.array(AssessmentSchema),
});

// Schema for signed URL response
const SignedUrlResponseSchema = z.object({
  signedUrl: z.string(),
});

export function PatientInterventionsTestsSection({
  patientId,
  title = "Testes Aplicados",
}: PatientInterventionsTestsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadingTestId, setUploadingTestId] = useState<string | null>(null);
  const [editingTestIndex, setEditingTestIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const {
    data: tests = [],
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.tests.byPatient(patientId),
    queryFn: async () => {
      try {
        const result = await getPatientAssessmentsAction({ patientId });
        const data = unwrapTypedActionResult(result, AssessmentsResponseSchema);
        return data.assessments;
      } catch (err) {
        if (isActionError(err)) {
          throw new Error(err.message);
        }
        throw err;
      }
    },
    staleTime: 30000,
  });

  const handleOpenDialog = (index?: number) => {
    setEditingTestIndex(index ?? null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTestIndex(null);
  };

  const onSubmit = async (data: PatientTestFormValues) => {
    try {
      setIsMutating(true);
      if (editingTestIndex !== null) {
        const test = tests[editingTestIndex];
        if (!test) return;
        unwrapActionResult(await updatePatientTestAction({
          testId: test.id,
          updates: {
            testName: data.test_name,
            appliedAt: data.applied_at,
          },
        }));
        toast.success("Teste atualizado com sucesso");
      } else {
        unwrapActionResult(await createPatientTestAction({
          patientId,
          testName: data.test_name,
          testType: data.test_type || "psychological",
          appliedAt: data.applied_at,
        }));
        toast.success("Teste criado com sucesso");
      }
      await refetch();
      handleCloseDialog();
    } catch (error) {
      if (isActionError(error)) {
        toast.error(
          error.message ||
            (editingTestIndex !== null ? "Erro ao atualizar teste" : "Erro ao criar teste"),
        );
      } else {
        toast.error(editingTestIndex !== null ? "Erro ao atualizar teste" : "Erro ao criar teste");
      }
    } finally {
      setIsMutating(false);
    }
  };

  const handleArchive = async (testId: string, currentStatus: string) => {
    try {
      setIsMutating(true);
      unwrapActionResult(await updatePatientTestAction({
        testId,
        updates: {
          status: currentStatus === "archived" ? "applied" : "archived",
        },
      }));
      await refetch();
      toast.success("Status do teste atualizado");
    } catch (error) {
      if (isActionError(error)) {
        toast.error(error.message || "Erro ao atualizar status do teste");
      } else {
        toast.error("Erro ao atualizar status do teste");
      }
    } finally {
      setIsMutating(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingTestId) return;

    try {
      const result = await uploadPatientTestResultFileAction({
        file,
        patientId,
        testId: uploadingTestId,
      });
      unwrapActionResultVoid(result);

      await refetch();
      toast.success("Arquivo enviado com sucesso");
    } catch (error) {
      if (isActionError(error)) {
        toast.error(error.message || "Erro ao enviar arquivo");
      } else {
        toast.error("Erro ao enviar arquivo");
      }
    } finally {
      setUploadingTestId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownloadFile = async (testId: string) => {
    try {
      const result = await getPatientTestResultSignedUrlAction({
        testId,
        expiresIn: 3600,
      });
      const { signedUrl } = unwrapTypedActionResult(result, SignedUrlResponseSchema);

      window.open(signedUrl, "_blank");
    } catch (error) {
      if (isActionError(error)) {
        toast.error(error.message || "Erro ao baixar arquivo");
      } else {
        toast.error("Erro ao baixar arquivo");
      }
    }
  };

  if (isPending) {
    return (
      <section className="space-y-6">
        <PatientDetailSubheader title={title} />
        <PatientDetailCardLoadingState message="Carregando testes..." />
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-6">
        <PatientDetailSubheader title={title} />
        <PatientDetailCardErrorState
          message="Não foi possível carregar os testes."
          onRetry={() => void refetch()}
        />
      </section>
    );
  }

  const statusLabels: Record<string, string> = {
    applied: "Aplicado",
    corrected: "Corrigido",
    archived: "Arquivado",
  };

  return (
    <section className="space-y-6">
      <PatientDetailSubheader title={title}>
        <BrandButton
          variant="ghost"
          size="sm"
          onClick={() => handleOpenDialog()}
          className="rounded-full px-4"
        >
          Registrar teste
        </BrandButton>
      </PatientDetailSubheader>

      {tests.length === 0 ? (
        <PatientDetailCardEmptyState
          icon={Beaker}
          title="Nenhum teste aplicado"
          subtitle="Registre seu primeiro teste psicológico para este paciente"
        />
      ) : (
        <div className="space-y-3">
          {tests.map((test, index) => {
            const statusLabel = test.status
              ? (statusLabels[test.status] ?? test.status)
              : "Desconhecido";
            const hasFile = !!test.fileUrl;

            return (
              <div
                key={test.id}
                className="group flex flex-col gap-2 rounded-2xl bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/60"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{test.testName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {statusLabel}
                      </span>
                      {test.testType && (
                        <span className="text-xs text-muted-foreground">Tipo: {test.testType}</span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(
                          new Date(test.appliedAt ?? test.createdAt ?? new Date()),
                          { locale: ptBR, addSuffix: true },
                        )}
                      </span>
                      {hasFile && (
                        <span className="text-xs font-medium text-green-600">✓ Com arquivo</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  {!hasFile && (
                    <BrandButton
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        setUploadingTestId(test.id);
                        fileInputRef.current?.click();
                      }}
                      disabled={isMutating}
                    >
                      <FileUp className="h-4 w-4" />
                    </BrandButton>
                  )}

                  {hasFile && (
                    <BrandButton
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        void handleDownloadFile(test.id);
                      }}
                      disabled={isMutating}
                    >
                      <Download className="h-4 w-4" />
                    </BrandButton>
                  )}

                  <BrandButton
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      void handleOpenDialog(index);
                    }}
                    disabled={isMutating}
                  >
                    <Edit2 className="h-4 w-4" />
                  </BrandButton>

                  <BrandButton
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      void handleArchive(test.id, test.status ?? "");
                    }}
                    disabled={isMutating}
                  >
                    <Archive className="h-4 w-4" />
                  </BrandButton>

                  <BrandButton
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setTestToDelete({ id: test.id, name: test.testName ?? "" })}
                    disabled={isMutating}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </BrandButton>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        onChange={(e) => {
          void handleFileChange(e);
        }}
        accept="image/*,.pdf"
        className="hidden"
      />

      <PatientTestDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={(data) => {
          void onSubmit(data);
        }}
        initialData={
          editingTestIndex !== null
            ? (() => {
                const t = tests[editingTestIndex];
                if (!t) return null;
                const appliedAt =
                  t.appliedAt != null
                    ? new Date(t.appliedAt).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0];
                return {
                  test_name: t.testName ?? "",
                  applied_at: appliedAt ?? new Date().toISOString().slice(0, 10),
                  test_type: t.testType ?? "psychological",
                };
              })()
            : null
        }
        isSubmitting={isMutating}
      />

      <ConfirmDeleteSimpleDialog
        open={testToDelete !== null}
        onOpenChange={(open) => !open && setTestToDelete(null)}
        title="Excluir teste"
        description={`Tem certeza que deseja excluir o teste "${testToDelete?.name ?? ""}"? Essa ação não pode ser desfeita.`}
        onConfirm={() => {
          if (!testToDelete) return;
          void (async () => {
            try {
              setIsMutating(true);
              unwrapActionResult(await deletePatientTestAction({ testId: testToDelete.id }));
              await refetch();
              setTestToDelete(null);
            } catch (error) {
              if (isActionError(error)) {
                toast.error(error.message || "Erro ao excluir teste");
              } else {
                toast.error("Erro ao excluir teste");
              }
            } finally {
              setIsMutating(false);
            }
          })();
        }}
        isDeleting={isMutating}
      />
    </section>
  );
}
