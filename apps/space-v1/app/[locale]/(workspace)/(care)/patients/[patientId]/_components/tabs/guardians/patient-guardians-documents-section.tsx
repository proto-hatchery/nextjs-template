"use client";

import { useQuery } from "@tanstack/react-query";
import type { GuardianDocument } from "@workspace/supabase-data/types/entities";
import { queryKeys } from "@/compat/supabase/utils/query-keys";
import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, CheckCircle, Clock, FileText, XCircle } from "lucide-react";

import { fetchPatientGuardiansData } from "../../../_queries/patient-detail-client";
import {
  PatientDetailCardEmptyState,
  PatientDetailCardErrorState,
  PatientDetailCardLoadingState,
} from "../../shared/patient-detail-card-states";
import { PatientDetailSubheader } from "../../shared/patient-detail-subheader";

export interface PatientGuardiansDocumentsSectionProps {
  patientId: string;
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  authorization: "Autorização",
  responsibility_term: "Termo de Responsabilidade",
  treatment_authorization: "Autorização para Tratamento",
  information_sharing_authorization: "Autorização de Compartilhamento",
  identity_document: "Documento de Identidade",
  other: "Outro",
};

const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  valid: "Válido",
  expired: "Expirado",
  pending: "Pendente",
  rejected: "Rejeitado",
};

const DOCUMENT_STATUS_COLORS: Record<string, string> = {
  valid: "bg-green-500/10 text-green-700 dark:text-green-400",
  expired: "bg-red-500/10 text-red-700 dark:text-red-400",
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  rejected: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
};

const DOCUMENT_STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  valid: CheckCircle,
  expired: XCircle,
  pending: Clock,
  rejected: AlertCircle,
};

export function PatientGuardiansDocumentsSection({
  patientId,
}: PatientGuardiansDocumentsSectionProps) {
  const {
    data: guardiansResponse,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.patients.guardians(patientId),
    queryFn: () => fetchPatientGuardiansData(patientId),
  });

  if (isPending) {
    return (
      <section className="space-y-6">
        <PatientDetailSubheader title="Documentação Legal" />
        <PatientDetailCardLoadingState message="Carregando documentos..." />
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-6">
        <PatientDetailSubheader title="Documentação Legal" />
        <PatientDetailCardErrorState
          message="Erro ao carregar documentos."
          onRetry={() => void refetch()}
        />
      </section>
    );
  }

  const guardians = guardiansResponse;
  const documents = guardians?.documents ?? [];

  // Calculate statistics
  const validDocuments = documents.filter((d: GuardianDocument) => d.status === "valid").length;
  const expiredDocuments = documents.filter((d: GuardianDocument) => d.status === "expired").length;
  const pendingDocuments = documents.filter((d: GuardianDocument) => d.status === "pending").length;

  // Check essential documents
  const hasAuthorizationDoc = documents.some(
    (d: GuardianDocument) => d.document_type === "authorization" && d.status === "valid",
  );
  const hasResponsibilityTerm = documents.some(
    (d: GuardianDocument) => d.document_type === "responsibility_term" && d.status === "valid",
  );
  const hasTreatmentAuth = documents.some(
    (d: GuardianDocument) => d.document_type === "treatment_authorization" && d.status === "valid",
  );

  const essentialDocsCount = [hasAuthorizationDoc, hasResponsibilityTerm, hasTreatmentAuth].filter(
    Boolean,
  ).length;

  if (documents.length === 0) {
    return (
      <section className="space-y-6">
        <PatientDetailSubheader title="Documentação Legal">
          <BrandButton variant="ghost" size="sm" family="rounded">
            Fazer upload
          </BrandButton>
        </PatientDetailSubheader>

        {/* Summary statistics */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Total de Documentos</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">0</p>
            <p className="text-xs text-muted-foreground">Nenhum documento anexado</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Documentos Essenciais</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">0/3</p>
            <p className="text-xs text-muted-foreground">Autorização, Termo, Tratamento</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Status</span>
            </div>
            <p className="text-2xl font-semibold text-yellow-600">Pendente</p>
            <p className="text-xs text-muted-foreground">Documentação incompleta</p>
          </div>
        </div>

        <PatientDetailCardEmptyState
          icon={FileText}
          title="Nenhum documento anexado"
          subtitle="Faça upload dos documentos legais necessários para o atendimento"
        />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PatientDetailSubheader title="Documentação Legal">
        <BrandButton variant="ghost" size="sm" family="rounded">
          Fazer upload
        </BrandButton>
      </PatientDetailSubheader>

      {/* Document statistics */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Documents */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Total de Documentos</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{documents.length}</p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle className="size-3" />
              {validDocuments} válidos
            </span>
            {expiredDocuments > 0 && (
              <span className="flex items-center gap-1">
                <XCircle className="size-3" />
                {expiredDocuments} expirados
              </span>
            )}
            {pendingDocuments > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {pendingDocuments} pendentes
              </span>
            )}
          </div>
        </div>

        {/* Essential Documents */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Documentos Essenciais</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{essentialDocsCount}/3</p>
          <p className="text-xs text-muted-foreground">
            {hasAuthorizationDoc ? "✓" : "○"} Autorização • {hasResponsibilityTerm ? "✓" : "○"}{" "}
            Termo • {hasTreatmentAuth ? "✓" : "○"} Tratamento
          </p>
        </div>

        {/* Overall Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Status Geral</span>
          </div>
          <p
            className={cn(
              "text-2xl font-semibold",
              essentialDocsCount === 3 ? "text-green-600" : "text-yellow-600",
            )}
          >
            {essentialDocsCount === 3 ? "Completo" : "Incompleto"}
          </p>
          <p className="text-xs text-muted-foreground">
            {essentialDocsCount === 3
              ? "Todos documentos essenciais presentes"
              : "Faltam documentos essenciais"}
          </p>
        </div>
      </div>

      {/* Document list */}
      <div>
        <h3 className="mb-4 text-sm font-medium text-foreground">Documentos Anexados</h3>
        <div className="space-y-3">
          {documents.map((doc: GuardianDocument) => {
            const status = String(doc.status ?? "pending");
            const statusLabel = DOCUMENT_STATUS_LABELS[status] ?? status;
            const statusColor = DOCUMENT_STATUS_COLORS[status] ?? "bg-gray-500/10 text-gray-700";
            const StatusIcon = DOCUMENT_STATUS_ICONS[status] ?? FileText;
            const docType = String(doc.document_type);
            const typeLabel = DOCUMENT_TYPE_LABELS[docType] ?? docType;

            return (
              <div
                key={doc.id}
                className="flex items-start justify-between gap-4 rounded-lg border bg-transparent px-4 py-3 transition-all hover:border-foreground/20 hover:bg-accent/50"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  {/* Title and status */}
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{doc.title}</span>
                    <span
                      className={cn(
                        "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                        statusColor,
                      )}
                    >
                      <StatusIcon className="size-3" />
                      {statusLabel}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Tipo: {typeLabel}</span>
                    {doc.uploaded_at && (
                      <span>
                        Upload:{" "}
                        {format(new Date(String(doc.uploaded_at)), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    )}
                    {doc.expires_at && (
                      <span>
                        Validade:{" "}
                        {format(new Date(String(doc.expires_at)), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    )}
                    {doc.file_size && <span>Tamanho: {(doc.file_size / 1024).toFixed(1)} KB</span>}
                  </div>

                  {doc.description && (
                    <p className="text-xs text-muted-foreground">{doc.description}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <BrandButton variant="ghost" size="sm">
                    Ver
                  </BrandButton>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
