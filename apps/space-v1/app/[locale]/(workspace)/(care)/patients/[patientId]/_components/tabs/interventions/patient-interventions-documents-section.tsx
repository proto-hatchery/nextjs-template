"use client";

import { useQueryClient } from "@tanstack/react-query";
import { formatBrazilianPhone } from "@workspace/forms/utils/phone";
import { createGeneratedDocumentAction } from "@workspace/supabase-data/actions/documents/create-generated-document";
import { deleteGeneratedDocumentAction } from "@workspace/supabase-data/actions/documents/delete-generated-document";
import { renameGeneratedDocumentAction } from "@workspace/supabase-data/actions/documents/rename-generated-document";
import type { GeneratedDocumentWithTemplate } from "@workspace/supabase-data/types/entities";
import {
  useDocumentTemplates,
  usePatientGeneratedDocuments,
} from "@workspace/supabase-data/hooks/documents";
import { usePatients as usePsychologistPatients } from "@workspace/supabase-data/hooks/patients";
import { isActionError } from "@workspace/supabase-data/lib/boundary/action-error";
import { unwrapActionResult as unwrapTypedActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { queryKeys } from "@workspace/supabase-data/utils/query-keys";
import { safeLogger } from "@workspace/supabase-data/utils/safe-logger";
import { Input } from "@workspace/ui/components/input";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { BrandButton } from "@workspace/brand/components/brand-button";
import {
  FluriFormDialogFooter,
  FluriFormDialogShell,
} from "@workspace/brand/overlays/fluri-form-dialog-shell";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Download, ExternalLink, FileText, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { ConfirmDeleteSimpleDialog } from "../../shared/confirm-delete-simple-dialog";
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
import { CreateDocumentDialog } from "./create-document-dialog";
import { type CreateDocumentInput } from "./create-document-schema";

export interface PatientInterventionsDocumentsSectionProps {
  patientId: string;
}

// Schema for document creation response
const CreateDocumentResponseSchema = z.object({
  document: z.object({
    id: z.string(),
  }),
  warnings: z.array(z.any()).optional(),
});

function isDocumentDebugEnabled(): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem("fluri:debug:documents") !== "0";
  } catch {
    return true;
  }
}

function logPatientDocumentsDebug(message: string, payload?: unknown): void {
  if (!isDocumentDebugEnabled()) return;
  safeLogger.info("[documents.patient-tab]", { message, payload });
}

export function PatientInterventionsDocumentsSection({
  patientId,
}: PatientInterventionsDocumentsSectionProps) {
  const _isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Rename modal states
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingDocTitle, setEditingDocTitle] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<{ id: string; title: string } | null>(null);

  // Create modal states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMutatingDocument, setIsMutatingDocument] = useState(false);

  // Query to list documents
  const {
    data: documents = [],
    isPending,
    error,
    refetch,
  } = usePatientGeneratedDocuments(patientId);

  const { data: templates = [], isPending: isPendingTemplates } = useDocumentTemplates();

  const { data: patients = [] } = usePsychologistPatients();

  useEffect(() => {
    logPatientDocumentsDebug("component mounted", { patientId });
  }, [patientId]);

  const patientOptions = useMemo(
    () =>
      patients.map((p) => {
        const phoneRaw = p.phone;
        let formattedPhone: string | null = null;

        if (phoneRaw && typeof phoneRaw === "string") {
          const phone: string = phoneRaw;
          if (phone.includes("+55") || phone.startsWith("55")) {
            const digitsOnly = phone.replace(/\D/g, "");
            const brazilianDigitsStr: string = digitsOnly.startsWith("55")
              ? String(digitsOnly.slice(2))
              : String(digitsOnly);

            if (brazilianDigitsStr.length === 10 || brazilianDigitsStr.length === 11) {
              const formatPhone = (value: string): string => {
                try {
                  const result = formatBrazilianPhone(value);
                  return typeof result === "string" ? result : String(result);
                } catch {
                  return value;
                }
              };
              formattedPhone = formatPhone(brazilianDigitsStr);
            } else {
              formattedPhone = phone;
            }
          } else {
            formattedPhone = phone;
          }
        }

        return {
          id: p.id,
          name: p.displayName ?? p.full_name ?? "Paciente sem nome",
          subtitle: formattedPhone ?? "Sem telefone cadastrado",
          status: "active" as const,
        };
      }),
    [patients],
  );

  const handleCreateDocument = async (data: CreateDocumentInput) => {
    logPatientDocumentsDebug("submit requested", {
      patientId: data.patientId,
      templateId: data.templateId,
      title: data.title,
      templatesCount: templates.length,
    });
    if (!data.patientId || !data.templateId) return;

    setIsSubmitting(true);
    try {
      const result = await createGeneratedDocumentAction({
        patientId: data.patientId,
        templateId: data.templateId,
        title: data.title,
      });

      const { document, warnings } = unwrapTypedActionResult(result, CreateDocumentResponseSchema);

      if (warnings && warnings.length > 0) {
        logPatientDocumentsDebug("submit succeeded with warnings", {
          documentId: document.id,
          warnings: warnings,
        });
        const warningMessages = warnings
          .map((w: unknown) => (typeof w === "string" ? w : String(w)))
          .join(", ");
        toast.warning(
          `Documento criado, mas alguns campos não puderam ser preenchidos: ${warningMessages}`,
        );
      } else {
        logPatientDocumentsDebug("submit succeeded", { documentId: document.id });
        toast.success("Documento gerado com sucesso!");
      }

      setIsCreateDialogOpen(false);
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.generated() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.generated(patientId) });
      logPatientDocumentsDebug("navigating to document edit", { documentId: document.id });
      router.replace(`/documents/${document.id}/edit`);
    } catch (error: unknown) {
      logPatientDocumentsDebug("submit threw exception", {
        error: error instanceof Error ? error.message : String(error),
      });
      if (isActionError(error)) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao gerar documento.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRename = async () => {
    if (!editingDocId || !editingDocTitle.trim()) {
      toast.error("Dados incompletos para renomear");
      return;
    }

    try {
      setIsMutatingDocument(true);
      unwrapActionResult(await renameGeneratedDocumentAction({
        documentId: editingDocId,
        title: editingDocTitle.trim(),
      }));
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents.generated(patientId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents.detail(editingDocId) });

      toast.success("Documento renomeado com sucesso");
      setIsEditDialogOpen(false);
      setEditingDocId(null);
      setEditingDocTitle("");
    } catch (ignoreError: unknown) {
      const fallback = "Erro ao renomear documento";
      const msg: string =
        ignoreError instanceof Error ? String(ignoreError.message ?? fallback) : fallback;
      toast.error(msg);
    } finally {
      setIsMutatingDocument(false);
    }
  };

  const handleDeleteConfirm = async (docId: string) => {
    try {
      setIsMutatingDocument(true);
      unwrapActionResult(await deleteGeneratedDocumentAction({ documentId: docId }));
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents.generated(patientId) });

      toast.success("Documento deletado com sucesso");
      setDocToDelete(null);
    } catch (ignoreError: unknown) {
      const fallback = "Erro ao deletar documento";
      const msg: string =
        ignoreError instanceof Error ? String(ignoreError.message ?? fallback) : fallback;
      toast.error(msg);
    } finally {
      setIsMutatingDocument(false);
    }
  };

  const handleOpenRename = (docId: string, currentTitle: string) => {
    setEditingDocId(docId);
    setEditingDocTitle(currentTitle);
    setIsEditDialogOpen(true);
  };

  const handleOpenDocument = (docId: string) => {
    router.push(`/documents/${docId}/edit`);
  };

  const handleDownloadDocument = (doc: GeneratedDocumentWithTemplate) => {
    window.open(`/api/documents/${doc.id}/pdf?format=abnt`, "_blank");
  };

  if (isPending) {
    return (
      <section className="space-y-6">
        <PatientDetailSubheader title="Documentos Gerados" />
        <PatientDetailCardLoadingState message="Carregando documentos..." />
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-6">
        <PatientDetailSubheader title="Documentos Gerados" />
        <PatientDetailCardErrorState
          message="Não foi possível carregar os documentos."
          onRetry={() => void refetch()}
        />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PatientDetailSubheader title="Documentos Gerados">
        <BrandButton
          variant="ghost"
          size="sm"
          onClick={() => setIsCreateDialogOpen(true)}
          className="rounded-full px-4"
        >
          Gerar documento
        </BrandButton>
      </PatientDetailSubheader>

      {documents.length === 0 ? (
        <PatientDetailCardEmptyState
          icon={FileText}
          title="Nenhum documento gerado"
          subtitle="Crie seu primeiro documento a partir de um template"
        />
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => {
            const templateName = doc.template?.title ?? "Template personalizado";
            const timeAgo = formatDistanceToNow(
              new Date(doc.updated_at ?? doc.created_at ?? Date.now()),
              {
                locale: ptBR,
                addSuffix: true,
              },
            );

            return (
              <PatientDetailCardItem
                key={doc.id}
                icon={<FileText className="size-5 text-muted-foreground" />}
                onClick={() => handleOpenDocument(doc.id)}
                actions={
                  <PatientDetailCardItemActions
                    onDelete={() =>
                      setDocToDelete({ id: doc.id, title: doc.title ?? "Sem título" })
                    }
                    deleteDisabled={isMutatingDocument}
                    deleteAriaLabel="Deletar documento"
                    stopPropagation
                  >
                    <BrandButton
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:bg-background/80 hover:text-foreground"
                      aria-label="Abrir documento"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDocument(doc.id);
                      }}
                      disabled={isMutatingDocument}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </BrandButton>
                    <BrandButton
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:bg-background/80 hover:text-foreground"
                      aria-label="Baixar documento"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadDocument(doc);
                      }}
                      disabled={isMutatingDocument}
                    >
                      <Download className="h-4 w-4" />
                    </BrandButton>
                    <BrandButton
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:bg-background/80 hover:text-foreground"
                      aria-label="Renomear documento"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenRename(doc.id, doc.title ?? "Sem título");
                      }}
                      disabled={isMutatingDocument}
                    >
                      <Pencil className="h-4 w-4" />
                    </BrandButton>
                  </PatientDetailCardItemActions>
                }
              >
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {doc.title ?? "Sem título"}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {templateName} • {timeAgo}
                </p>
              </PatientDetailCardItem>
            );
          })}
        </div>
      )}

      <CreateDocumentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={(data) => {
          void handleCreateDocument(data);
        }}
        patientId={patientId}
        patientOptions={patientOptions}
        templates={templates}
        isPendingTemplates={isPendingTemplates}
        isSubmitting={isSubmitting}
      />

      <FluriFormDialogShell
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Renomear documento"
        onClose={() => setIsEditDialogOpen(false)}
      >
        <div className="px-5 py-6 space-y-4">
          <Input
            value={editingDocTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEditingDocTitle(e.target.value)
            }
            placeholder="Novo nome..."
            autoFocus
          />
        </div>
        <FluriFormDialogFooter
          onCancel={() => setIsEditDialogOpen(false)}
          onSubmit={() => {
            void handleRename();
          }}
          isSubmitting={isMutatingDocument}
          submitLabel="Salvar"
        />
      </FluriFormDialogShell>

      <ConfirmDeleteSimpleDialog
        open={docToDelete !== null}
        onOpenChange={(open) => !open && setDocToDelete(null)}
        title="Excluir documento"
        description={`Tem certeza que deseja excluir o documento "${docToDelete?.title ?? ""}"? Essa ação não pode ser desfeita.`}
        onConfirm={() => {
          if (docToDelete) {
            void handleDeleteConfirm(docToDelete.id);
          }
        }}
        isDeleting={isMutatingDocument}
      />
    </section>
  );
}
