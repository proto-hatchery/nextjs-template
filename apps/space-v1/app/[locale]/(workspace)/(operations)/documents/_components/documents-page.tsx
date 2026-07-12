"use client";

import { DocumentCard } from "@/compat/features/patients/ui/document-card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { FileText, Home } from "lucide-react";
import { toast } from "sonner";

import { PageContentHeader } from "../../../_components/page-content-header";

const DOCUMENTS = [
  {
    id: "receita-ansiedade",
    title: "Receita Medicamentosa - Ansiedade",
    category: "Receita",
    type: "prescription",
    description: "Prescrição padrão para tratamento de ansiedade e transtornos relacionados.",
    date: "12 Mar 24",
    team: [
      { name: "Dr. Silva", src: "https://github.com/shadcn.png" },
      { name: "Dra. Ana", src: "https://github.com/shadcn.png" },
    ],
    preview: {
      title: "Modelo de Receita.pdf",
      url: "receita.fluri.com.br",
      icon: <FileText className="h-5 w-5 text-blue-500" />,
    },
  },
  {
    id: "atestado-descanso",
    title: "Atestado Médico - Descanso",
    category: "Atestado",
    type: "certificate",
    description: "Atestado para repouso médico de 3 dias para recuperação.",
    date: "02 Mai 23",
    team: [{ name: "Dr. João", src: "https://github.com/shadcn.png" }],
    preview: {
      title: "Atestado Padrão.pdf",
      url: "atestado.fluri.com.br",
      icon: <FileText className="h-5 w-5 text-purple-500" />,
    },
  },
  {
    id: "encaminhamento-terapia",
    title: "Encaminhamento - Terapia Cognitiva",
    category: "Encaminhamento",
    type: "referral",
    description: "Encaminhamento para psicólogo especialista em TCC.",
    date: "28 Fev 24",
    team: [
      { name: "Dra. Clara", src: "https://github.com/shadcn.png" },
      { name: "Dr. Pedro", src: "https://github.com/shadcn.png" },
      { name: "Enf. Maria", src: "https://github.com/shadcn.png" },
    ],
    preview: {
      title: "Guia de Encaminhamento.pdf",
      url: "guia.fluri.com.br",
      icon: <FileText className="h-5 w-5 text-orange-500" />,
    },
  },
];

export function DocumentsPageContent() {
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
              <BreadcrumbPage className="inline-flex items-center gap-1.5">
                <FileText size={16} />
                Documentos
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
      actions={[
        {
          key: "generate-document",
          label: "Gerar Documento",
          variant: "default",
          onClick: () => toast.info("Funcionalidade em desenvolvimento"),
        },
      ]}
    >
      <div className="flex h-full flex-1 flex-col gap-4 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DOCUMENTS.map((document) => (
            <DocumentCard
              key={document.id}
              title={document.title}
              category={document.category}
              description={document.description}
              date={document.date}
              preview={document.preview}
            />
          ))}
        </div>
      </div>
    </PageContentHeader>
  );
}
