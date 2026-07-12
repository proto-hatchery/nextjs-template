"use client";

import type { PatientWithDetails } from "@workspace/supabase-data/types/entities";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { AlertCircle, Home, MoreHorizontal, Phone, UserCircle } from "lucide-react";
import Link from "next/link";
import { Suspense, useMemo } from "react";

import { PageContentHeader } from "../../../../_components/page-content-header";
import { ComingSoonTab } from "../_components/coming-soon-tab";
import { PatientDetailSidebar } from "../_components/shared/patient-detail-sidebar";
import {
  type PatientDetailTabItem,
  PatientDetailTabs,
} from "../_components/shared/patient-detail-tabs";
import { ClinicalDataTab } from "../_components/tabs/clinical-data/clinical-data-tab";
import { PatientGuardiansTab } from "../_components/tabs/guardians/guardians-tab";
import { PatientInterventionsTab } from "../_components/tabs/interventions/interventions-tab";
import { PatientDetailOverview } from "../_components/tabs/overview/overview-tab";
import { SessionsTab } from "../_components/tabs/sessions/sessions-tab";
import { mapPatientToRecordCollections } from "../_utils/mapper";

interface PatientDetailViewProps {
  patient: PatientWithDetails;
  patientId: string;
  activeTab: string;
  tabs: PatientDetailTabItem[];
  caseIndexScore: number;
  whatsappHref: string | null;
  emergencyPhone?: string | null;
  onTabChange: (tab: string) => void;
  onCreateSession: () => void;
  onDeletePatient: () => void;
  onViewMissingFields: () => void;
}

function WhatsappIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="WhatsApp"
    >
      <path d="M20.52 3.48A11.84 11.84 0 0 0 12.06 0C5.49 0 .16 5.33.16 11.9c0 2.1.55 4.15 1.6 5.95L0 24l6.31-1.64a11.84 11.84 0 0 0 5.75 1.47h.01c6.57 0 11.9-5.33 11.9-11.9a11.84 11.84 0 0 0-3.45-8.45Zm-8.46 18.6h-.01a9.83 9.83 0 0 1-5-1.37l-.36-.2-3.74.97 1-3.64-.24-.37a9.83 9.83 0 0 1-1.52-5.23c0-5.43 4.42-9.85 9.85-9.85 2.63 0 5.1 1.02 6.96 2.88a9.83 9.83 0 0 1 2.88 6.96c0 5.43-4.42 9.85-9.85 9.85Zm5.38-7.38c-.29-.15-1.72-.85-1.98-.94-.27-.1-.46-.15-.65.15-.19.29-.74.94-.9 1.13-.17.19-.33.2-.62.05-.29-.15-1.23-.45-2.35-1.44-.87-.77-1.45-1.72-1.62-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.33.44-.5.15-.17.2-.29.29-.48.1-.19.05-.36-.02-.5-.07-.15-.65-1.56-.89-2.14-.23-.56-.47-.49-.65-.5l-.56-.01c-.19 0-.5.07-.76.36-.26.29-1 1-1 2.44s1.02 2.83 1.16 3.03c.15.19 2 3.05 4.85 4.28.68.29 1.2.46 1.61.58.68.22 1.3.19 1.79.12.55-.08 1.72-.7 1.96-1.37.24-.67.24-1.25.17-1.37-.07-.12-.26-.19-.55-.34Z" />
    </svg>
  );
}

export function PatientDetailView({
  patient,
  patientId,
  activeTab,
  tabs,
  caseIndexScore,
  whatsappHref,
  emergencyPhone = null,
  onTabChange,
  onCreateSession,
  onDeletePatient,
  onViewMissingFields,
}: PatientDetailViewProps) {
  return (
    <PageContentHeader
      breadcrumbs={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/home" className="inline-flex items-center gap-1.5">
                <Home size={16} />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/patients" className="inline-flex items-center gap-1.5">
                <UserCircle size={16} />
                Pacientes
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{patient.displayName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
      actions={
        <div className="flex items-center gap-2">
          {whatsappHref ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <BrandButton variant="ghost" size="icon-sm" asChild>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="WhatsApp do paciente"
                  >
                    <WhatsappIcon />
                  </a>
                </BrandButton>
              </TooltipTrigger>
              <TooltipContent>WhatsApp do paciente</TooltipContent>
            </Tooltip>
          ) : null}

          <Tooltip>
            <TooltipTrigger asChild>
              {emergencyPhone ? (
                <BrandButton variant="ghost" size="icon-sm" asChild>
                  <a href={`tel:${String(emergencyPhone)}`} aria-label="Contato de emergência">
                    <Phone className="size-4 text-destructive" />
                  </a>
                </BrandButton>
              ) : (
                <BrandButton
                  variant="ghost"
                  size="icon-sm"
                  aria-disabled="true"
                  onClick={(e) => e.preventDefault()}
                >
                  <Phone className="size-4 text-destructive opacity-50" />
                </BrandButton>
              )}
            </TooltipTrigger>
            <TooltipContent>
              {emergencyPhone ? "Contato de emergência" : "Sem contato de emergência cadastrado"}
            </TooltipContent>
          </Tooltip>

          <BrandButton variant="neutral" size="small" asChild>
            <Link href={`/notes/new?patientId=${patientId}`}>Nova nota</Link>
          </BrandButton>
          <BrandButton variant="secondary" size="small" onClick={onCreateSession}>
            Agendar sessão
          </BrandButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <BrandButton variant="ghost" size="icon-sm" aria-label="Mais ações">
                <MoreHorizontal className="size-4" />
              </BrandButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações rápidas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="sm:hidden">Nova nota clínica</DropdownMenuItem>
              <DropdownMenuItem className="sm:hidden">Agendar sessão</DropdownMenuItem>
              <DropdownMenuSeparator className="sm:hidden" />
              <DropdownMenuItem>Exportar dados</DropdownMenuItem>
              <DropdownMenuItem>Arquivar paciente</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={onDeletePatient}>
                Excluir paciente
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <div className="flex h-full overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-background shrink-0">
            <div className="w-full max-w-[52rem] mr-auto">
              <PatientDetailTabs value={activeTab} onChange={onTabChange} tabs={tabs} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 scrollbar-hide">
            <div className="w-full max-w-[52rem] mr-auto">
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <TabContent activeTab={activeTab} patient={patient} patientId={patientId} />
              </Suspense>
            </div>
          </div>
        </div>

        <aside className="hidden lg:flex w-[380px] shrink-0 border-l border-border/50 overflow-y-auto scrollbar-hide">
          <PatientDetailSidebar
            patient={patient}
            patientId={patientId}
            caseIndexScore={caseIndexScore}
            onViewMissing={onViewMissingFields}
          />
        </aside>
      </div>
    </PageContentHeader>
  );
}

function TabContent({
  activeTab,
  patient,
  patientId,
}: {
  activeTab: string;
  patient: PatientWithDetails;
  patientId: string;
}) {
  const patientRecord = useMemo(() => mapPatientToRecordCollections(patient), [patient]);

  switch (activeTab) {
    case "clinical-overview":
      return <PatientDetailOverview data={patientRecord} />;
    case "documents":
      return <ClinicalDataTab patientId={patientId} />;
    case "sessions":
      return <SessionsTab patientId={patientId} />;
    case "guardians":
      return <PatientGuardiansTab patientId={patient.id} />;
    case "medical-records":
      return <PatientInterventionsTab patientId={patientId} />;
    default:
      return (
        <ComingSoonTab
          title="Conteúdo em desenvolvimento"
          description="Estamos preparando esta aba para você."
        />
      );
  }
}

export function PatientDetailErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <AlertCircle className="size-12 text-destructive" />
      <h2 className="text-lg font-semibold">Erro ao carregar paciente</h2>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
