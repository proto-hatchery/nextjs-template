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
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { HomeIcon, Loader2, UsersRound } from "lucide-react";
import { MoreHorizontal, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { StandardPageHeader } from "../../../../../_components/layout/standard-page-header";
import { SpaceEventCreationModal } from "../../../../../_components/session-creation/space-event-creation-modal";
import { DeletePatientDialog } from "./delete-patient-dialog";

interface PatientDetailHeaderProps {
  patient: PatientWithDetails;
}

function getDigits(phoneRaw?: string | null) {
  if (!phoneRaw) return "";
  return String(phoneRaw).replace(/\D/g, "");
}

function getWhatsappHref(phoneRaw?: string | null): string | null {
  const digits = getDigits(phoneRaw);
  if (!digits || digits.length < 10) return null;
  return `https://wa.me/${digits}`;
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

export function PatientDetailHeader({ patient }: PatientDetailHeaderProps) {
  const router = useRouter();
  const whatsappHref = getWhatsappHref(patient.phone);
  const emergencyPhone: string | null = null;
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNavigatingToNote, setIsNavigatingToNote] = useState(false);

  return (
    <StandardPageHeader className="sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/home" className="inline-flex items-center gap-1.5">
                <HomeIcon size={16} aria-hidden="true" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/patients" className="inline-flex items-center gap-1.5">
                <UsersRound size={16} aria-hidden="true" />
                Pacientes
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{patient.displayName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Quick contact */}
        {whatsappHref ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <BrandButton variant="neutral" size="icon-sm" asChild>
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
                  <Phone className="size-4" />
                </a>
              </BrandButton>
            ) : (
              <BrandButton
                variant="ghost"
                size="icon-sm"
                aria-disabled="true"
                className="opacity-50 pointer-events-auto"
                onClick={(e) => e.preventDefault()}
              >
                <Phone className="size-4" />
              </BrandButton>
            )}
          </TooltipTrigger>
          <TooltipContent>
            {emergencyPhone ? "Contato de emergência" : "Sem contato de emergência cadastrado"}
          </TooltipContent>
        </Tooltip>

        {/* Main actions */}
        <BrandButton
          variant="neutral"
          size="sm"
          disabled={isNavigatingToNote}
          onClick={() => {
            setIsNavigatingToNote(true);
            router.push(`/notes/new?patientId=${patient.id}`);
          }}
        >
          {isNavigatingToNote ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
          Nova nota
        </BrandButton>
        <BrandButton
          variant="default"
          size="sm"
          className="gap-2 bg-brand-600 hover:bg-brand-700 text-white"
          onClick={() => setIsCreateSessionOpen(true)}
        >
          Agendar sessão
        </BrandButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <BrandButton variant="neutral" size="icon-sm" aria-label="Mais ações">
              <MoreHorizontal className="size-4" />
            </BrandButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações rápidas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Exportar dados</DropdownMenuItem>
            <DropdownMenuItem>Arquivar paciente</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              Excluir paciente
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SpaceEventCreationModal
        isOpen={isCreateSessionOpen}
        onClose={() => setIsCreateSessionOpen(false)}
        defaultPatientId={patient.id}
        onSuccess={() => router.refresh()}
      />

      <DeletePatientDialog
        patient={patient}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </StandardPageHeader>
  );
}
