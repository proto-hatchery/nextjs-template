"use client";

import { FieldDisplay } from "@/compat/features/patients/ui/field-display";
import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { CircleCheck, CircleDashed } from "lucide-react";
import { MoreHorizontal, Plus } from "lucide-react";

import type {
  PatientRecordCollections,
  PatientRecordField,
  PatientRecordSection,
  PatientRecordType,
} from "../../../types";

interface PatientInfoSummaryCardProps {
  dataset: PatientRecordCollections;
  completion: {
    completed: number;
    total: number;
    percentage: number;
  };
}

const GROUPS: { title: string; fields: { section: PatientRecordType; key: string }[] }[] = [
  {
    title: "Identificação",
    fields: [
      { section: "personal", key: "fullName" },
      { section: "personal", key: "socialName" },
      { section: "personal", key: "dateOfBirth" },
      { section: "identification", key: "cpf" },
      { section: "identification", key: "rg" },
      { section: "personal", key: "placeOfBirth" },
    ],
  },
  {
    title: "Informações pessoais",
    fields: [
      { section: "personal", key: "pronouns" },
      { section: "personal", key: "gender" },
      { section: "personal", key: "sexualOrientation" },
      { section: "personal", key: "maritalStatus" },
      { section: "personal", key: "educationLevel" },
      { section: "personal", key: "profession" },
    ],
  },
  {
    title: "Contato e endereço",
    fields: [
      { section: "contact", key: "phone" },
      { section: "contact", key: "email" },
      { section: "contact", key: "address" },
      { section: "contact", key: "neighborhood" },
      { section: "contact", key: "city" },
      { section: "contact", key: "state" },
      { section: "contact", key: "postalCode" },
      { section: "contact", key: "country" },
    ],
  },
];

export function PatientInfoSummaryCard({ dataset, completion }: PatientInfoSummaryCardProps) {
  const sectionsById = Object.fromEntries(dataset.sections.map((section) => [section.id, section]));

  return (
    <div className="rounded-2xl bg-muted/30">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Informações preenchidas do paciente
          </p>
          <p className="text-sm text-muted-foreground">Resumo cadastral e campos obrigatórios</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <CompletionBadge value={completion} />
          <div className="flex items-center gap-2 text-muted-foreground">
            <BrandButton variant="ghost" size="icon">
              <Plus className="size-4" />
            </BrandButton>
            <BrandButton variant="ghost" size="icon">
              <MoreHorizontal className="size-4" />
            </BrandButton>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 px-6 pb-4 text-xs font-medium text-muted-foreground">
        <IndicatorPill
          label="Cadastro"
          value={completionStatusLabel(completion.percentage)}
          tone={getCompletionStatus(completion.percentage)}
        />
        {dataset.relationshipStartDate ? (
          <IndicatorPill
            label="Desde"
            value={new Date(dataset.relationshipStartDate).toLocaleDateString("pt-BR", {
              month: "short",
              year: "numeric",
            })}
          />
        ) : null}
      </div>

      <div className="space-y-8 p-6">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <div className="mb-4 flex items-center gap-3">
              <p className="text-sm font-semibold text-foreground">{group.title}</p>
              <div className="h-px flex-1 bg-border/60" />
            </div>
            <div className="grid gap-x-8 gap-y-6 md:grid-cols-3">
              {group.fields.map((field) => {
                const resolvedField = getField(sectionsById[field.section], field.key);
                return resolvedField ? (
                  <FieldDisplay key={`${group.title}-${field.key}`} field={resolvedField} />
                ) : null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getField(
  section: PatientRecordSection | undefined,
  key: string,
): PatientRecordField | undefined {
  return section?.fields.find((field) => field.key === key);
}

function CompletionBadge({
  value,
}: {
  value: {
    completed: number;
    total: number;
    percentage: number;
  };
}) {
  const status = getCompletionStatus(value.percentage);
  const Icon = status === "complete" ? CircleCheck : CircleDashed;

  return (
    <div className="inline-flex items-center gap-3 rounded-full bg-background/70 px-4 py-2">
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full",
          statusColors(status).bg,
        )}
      >
        <Icon className={cn("size-4", statusColors(status).text)} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Campos essenciais</p>
        <p className="text-sm font-semibold text-foreground">
          {value.completed} / {value.total}
        </p>
      </div>
    </div>
  );
}

function getCompletionStatus(percentage: number): "complete" | "partial" | "critical" {
  if (percentage >= 80) return "complete";
  if (percentage >= 60) return "partial";
  return "critical";
}

function statusColors(status: "complete" | "partial" | "critical") {
  switch (status) {
    case "complete":
      return { bg: "bg-emerald-50 text-emerald-600", text: "text-emerald-600" };
    case "partial":
      return { bg: "bg-amber-50 text-amber-600", text: "text-amber-600" };
    default:
      return { bg: "bg-rose-50 text-rose-600", text: "text-rose-600" };
  }
}

function IndicatorPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "complete" | "partial" | "critical";
}) {
  const palette: Record<string, string> = {
    complete: "bg-emerald-50 text-emerald-700",
    partial: "bg-amber-50 text-amber-700",
    critical: "bg-rose-50 text-rose-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${tone ? palette[tone] : "bg-muted text-foreground"}`}
    >
      <span className="text-[10px] uppercase tracking-wide">{label}</span>
      <span className="text-xs font-semibold">{value}</span>
    </span>
  );
}

function completionStatusLabel(percentage: number) {
  if (percentage >= 80) return "Completo";
  if (percentage >= 60) return "Parcial";
  return "Crítico";
}
