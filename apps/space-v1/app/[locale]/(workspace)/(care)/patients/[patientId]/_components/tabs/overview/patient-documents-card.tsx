"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormProvider, useForm, zodResolver } from "@workspace/forms/react-hook-form";
import { createPatientDocumentAction } from "@workspace/supabase-data/actions/documents/create-patient-document";
import { deletePatientDocumentAction } from "@workspace/supabase-data/actions/documents/delete-patient-document";
import type { PatientWithDetails } from "@workspace/supabase-data/types/entities";
import { isActionError } from "@workspace/supabase-data/lib/boundary/action-error";
import {
  unwrapActionResult,
  unwrapActionResultVoid,
} from "@workspace/supabase-data/lib/boundary/unwrap-action";
import { queryKeys } from "@/compat/supabase/utils/query-keys";
import type { Json } from "@workspace/supabase-infra/types/database";
import { parsePatientDocuments } from "@/compat/supabase/utils/json-field-parsers";
import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { AlertCircle, ExternalLink, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import type { PatientDocumentSummary } from "../../../types";
import { ConfirmDeleteSimpleDialog } from "../../shared/confirm-delete-simple-dialog";
import {
  PatientDetailCardDeleteButton,
  PatientDetailCardItem,
} from "../../shared/patient-detail-card-item";
import { PatientDetailCardEmptyState } from "../../shared/patient-detail-card-states";
import { PatientDetailSubheader } from "../../shared/patient-detail-subheader";
import { PatientDocumentForm } from "./patient-document-form";
import { type PatientDocumentFormValues, patientDocumentSchema } from "./patient-document-schema";

interface PatientDocumentsCardProps {
  documents: PatientDocumentSummary[];
  patientId: string;
}

// Schema for create document response
const CreateDocumentResponseSchema = z.object({
  document: z.custom<PatientDocumentSummary>(),
});

/**
 * Comprime uma imagem no cliente antes do upload
 * Usa canvas para reduzir dimensões e qualidade
 */
async function compressImageClient(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    maxSizeMB?: number;
  } = {},
): Promise<File> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 0.85, maxSizeMB = 4.5 } = options;

  // Se a imagem já estiver abaixo do limite, não comprime
  if (file.size <= maxSizeMB * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Reduz dimensões mantendo aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Não foi possível criar contexto do canvas"));
        return;
      }

      // Melhora qualidade da renderização
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Falha ao comprimir imagem"));
            return;
          }

          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: file.lastModified,
          });

          resolve(compressedFile);
        },
        file.type,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Falha ao carregar imagem"));
    };

    img.src = url;
  });
}

/**
 * Processa arquivo antes do upload
 * - Comprime imagens grandes
 * - Valida tamanho máximo
 */
async function processFileBeforeUpload(
  file: File,
): Promise<{ file: File; wasCompressed: boolean }> {
  // Se for imagem, tenta comprimir
  if (file.type.startsWith("image/")) {
    try {
      const compressed = await compressImageClient(file);
      return { file: compressed, wasCompressed: compressed.size < file.size };
    } catch {
      return { file, wasCompressed: false };
    }
  }

  // Para PDFs, apenas valida tamanho
  if (file.type === "application/pdf" && file.size > 10 * 1024 * 1024) {
    throw new Error(
      "PDF muito grande. Máximo permitido: 10MB. Tente dividir o arquivo ou usar uma versão mais compacta.",
    );
  }

  return { file, wasCompressed: false };
}

export function PatientDocumentsCard({ documents = [], patientId }: PatientDocumentsCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<PatientDocumentSummary | null>(null);

  const queryClient = useQueryClient();

  const safeDocuments = Array.isArray(documents) ? documents : [];
  const total = safeDocuments.length;
  const completed = safeDocuments.filter((doc) => doc.status === "complete").length;
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  const progress = { completed, total, percentage };

  const form = useForm<PatientDocumentFormValues>({
    resolver: zodResolver(patientDocumentSchema),
    defaultValues: {
      name: "",
      file: undefined,
    },
  });

  const { mutate: createDocument, isPending } = useMutation({
    mutationFn: async (values: PatientDocumentFormValues) => {
      if (!values.file) {
        throw new Error("Nenhum arquivo selecionado");
      }

      // Processa arquivo (compressão se necessário)
      const { file: processedFile, wasCompressed } = await processFileBeforeUpload(values.file);

      try {
        const data = unwrapActionResult(
          await createPatientDocumentAction({
            patientId,
            name: values.name,
            file: processedFile,
          }),
          CreateDocumentResponseSchema,
        );

        return { data: data.document, wasCompressed };
      } catch (error) {
        if (isActionError(error)) {
          const enhancedError = new Error(error.message);
          (enhancedError as Error & { code?: string; wasCompressed?: boolean }).code = error.code;
          (enhancedError as Error & { wasCompressed?: boolean }).wasCompressed = wasCompressed;
          throw enhancedError;
        }
        throw error;
      }
    },
    onMutate: async (newDoc) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.patients.detail(patientId) });
      const previousPatientData = queryClient.getQueryData<PatientWithDetails | null>(
        queryKeys.patients.detail(patientId),
      );

      queryClient.setQueryData<PatientWithDetails | null>(
        queryKeys.patients.detail(patientId),
        (old) => {
          if (!old) return old;
          const optimisticDoc: PatientDocumentSummary = {
            id: crypto.randomUUID(),
            label: newDoc.name,
            type: newDoc.file?.type ?? "application/pdf",
            status: "complete",
            url: "",
            size: newDoc.file ? `${(newDoc.file.size / 1024).toFixed(2)} KB` : "0 KB",
            uploadedAt: new Date().toISOString(),
          };
          const currentDocs = parsePatientDocuments(old.attached_documents);
          return {
            ...old,
            attached_documents: [...currentDocs, optimisticDoc] as unknown as Json,
          };
        },
      );
      return { previousPatientData };
    },
    onSuccess: (result) => {
      const compressionMsg = result.wasCompressed
        ? " (arquivo foi comprimido automaticamente)"
        : "";
      toast.success(`Documento adicionado com sucesso${compressionMsg}`);
      setIsAdding(false);
      form.reset();
    },
    onError: (error: Error & { code?: string; wasCompressed?: boolean }, _, context) => {
      // Tratamento de erro específico baseado no código de erro
      const errorCode = error.code;

      let title = "Erro ao adicionar documento";
      let description = error.message;

      switch (errorCode) {
        case "AUTH_SESSION_REQUIRED":
        case "AUTH_FORBIDDEN":
          title = "Acesso negado";
          description =
            "Sua sessão expirou ou você não tem permissão. Por favor, faça login novamente.";
          break;
        case "VALIDATION_MISSING_FIELD":
          title = "Campo obrigatório";
          description = "Por favor, preencha todos os campos obrigatórios.";
          break;
        case "VALIDATION_INVALID_FORMAT":
          title = "Arquivo inválido";
          description = "O arquivo não está em um formato válido.";
          break;
        case "DOCUMENTS_UPLOAD_FAILED":
        case "INFRA_STORAGE":
          title = "Falha no upload";
          description =
            error.message ||
            "Não foi possível enviar o arquivo. Verifique o tamanho (máx: 10MB para PDFs, 5MB para imagens).";
          break;
        case "INFRA_SUPABASE":
          title = "Erro ao salvar";
          description = "O arquivo foi enviado mas não pudemos salvá-lo. Tente novamente.";
          break;
        case "NOT_FOUND_PATIENT":
          title = "Paciente não encontrado";
          description = "O paciente não foi encontrado ou você não tem acesso.";
          break;
      }

      toast.error(title, {
        description: description,
        duration: 6000,
        icon: <AlertCircle className="size-4" />,
      });

      if (context?.previousPatientData) {
        queryClient.setQueryData(queryKeys.patients.detail(patientId), context.previousPatientData);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(patientId) });
    },
  });

  const { mutate: deleteDocument, isPending: isDeleting } = useMutation({
    mutationFn: async (documentId: string) => {
      unwrapActionResultVoid(
        await deletePatientDocumentAction({
          patientId,
          documentId,
        }),
      );

      return documentId;
    },
    onMutate: async (deletedDocId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.patients.detail(patientId) });
      const previousPatientData = queryClient.getQueryData<PatientWithDetails | null>(
        queryKeys.patients.detail(patientId),
      );

      queryClient.setQueryData<PatientWithDetails | null>(
        queryKeys.patients.detail(patientId),
        (old) => {
          if (!old) return old;
          const currentDocs = parsePatientDocuments(old.attached_documents);
          return {
            ...old,
            attached_documents: currentDocs.filter((d) => d.id !== deletedDocId) as unknown as Json,
          };
        },
      );
      return { previousPatientData };
    },
    onSuccess: () => {
      toast.success("Documento removido com sucesso");
      setDocumentToDelete(null);
    },
    onError: (error, _, context) => {
      const message = isActionError(error)
        ? error.message
        : "Não foi possível remover o documento. Tente novamente.";
      toast.error("Erro ao remover documento", {
        description: message,
      });
      if (context?.previousPatientData) {
        queryClient.setQueryData(queryKeys.patients.detail(patientId), context.previousPatientData);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(patientId) });
    },
  });

  const onSubmit = (values: PatientDocumentFormValues) => {
    createDocument(values);
  };

  return (
    <div className="space-y-6">
      <PatientDetailSubheader
        title="Documentos anexados"
        progress={progress}
        showCadastroBadge={false}
      >
        {!isAdding && (
          <BrandButton
            variant="ghost"
            size="sm"
            family="rounded"
            aria-label="Adicionar documento"
            onClick={() => setIsAdding(true)}
          >
            Adicionar
          </BrandButton>
        )}
      </PatientDetailSubheader>

      {isAdding && (
        <div className="rounded-2xl bg-muted/20 p-4 animate-in fade-in slide-in-from-top-2">
          <FormProvider {...form}>
            <PatientDocumentForm
              onCancel={() => {
                setIsAdding(false);
                form.reset();
              }}
              isSubmitting={isPending}
              onSubmit={onSubmit}
            />
          </FormProvider>
        </div>
      )}

      {safeDocuments.length === 0 && !isAdding ? (
        <PatientDetailCardEmptyState
          icon={FileText}
          title="Nenhum documento anexado"
          subtitle="Adicione documentos e consentimentos para este paciente."
        />
      ) : (
        <div className="space-y-3">
          {safeDocuments.map((doc) => (
            <PatientDetailCardItem
              key={doc.id}
              icon={<FileText className="size-5 text-muted-foreground" />}
              actions={
                <div className="flex items-center gap-2">
                  <PatientDetailCardDeleteButton
                    onClick={() => setDocumentToDelete(doc)}
                    ariaLabel="Excluir documento"
                  />
                  <span className={cn("text-sm font-medium", statusPalette(doc.status))}>
                    {statusCopy(doc.status)}
                  </span>
                  {doc.url ? (
                    <BrandButton variant="ghost" size="icon" asChild>
                      <a href={doc.url} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-4" />
                      </a>
                    </BrandButton>
                  ) : (
                    <BrandButton variant="ghost" size="icon" disabled>
                      <ExternalLink className="size-4" />
                    </BrandButton>
                  )}
                </div>
              }
            >
              <p className="text-sm font-medium text-foreground">{doc.label}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileType(doc.type)}
                {doc.uploadedAt ? ` • ${formatDateTime(doc.uploadedAt)}` : ""}
                {doc.size ? ` • ${doc.size}` : ""}
              </p>
            </PatientDetailCardItem>
          ))}
        </div>
      )}

      <ConfirmDeleteSimpleDialog
        open={!!documentToDelete}
        onOpenChange={(open) => !open && setDocumentToDelete(null)}
        title="Excluir documento"
        description={`Tem certeza que deseja excluir o documento "${documentToDelete?.label}"? Essa ação não pode ser desfeita.`}
        onConfirm={() => {
          if (documentToDelete) void deleteDocument(documentToDelete.id);
        }}
        isDeleting={isDeleting}
      />
    </div>
  );
}

function statusCopy(status: PatientDocumentSummary["status"]) {
  switch (status) {
    case "complete":
      return "Entregue";
    case "pending":
      return "Pendente";
    default:
      return "Ausente";
  }
}

function statusPalette(status: PatientDocumentSummary["status"]) {
  switch (status) {
    case "complete":
      return "text-emerald-600";
    case "pending":
      return "text-amber-600";
    default:
      return "text-rose-600";
  }
}

function formatFileType(mimeType?: string): string {
  if (!mimeType) return "Arquivo";

  const typeMap: Record<string, string> = {
    "application/pdf": "PDF",
    "image/jpeg": "Imagem JPEG",
    "image/png": "Imagem PNG",
    "image/jpg": "Imagem JPG",
    "text/plain": "Texto",
    "application/msword": "Documento Word",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Documento Word",
    "application/vnd.oasis.opendocument.text": "Documento ODT",
  };

  return typeMap[mimeType] ?? mimeType.split("/").pop()?.toUpperCase() ?? "Arquivo";
}

function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleDateString("pt-BR", { month: "short" });
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day} ${month} às ${hours}:${minutes}`;
}
