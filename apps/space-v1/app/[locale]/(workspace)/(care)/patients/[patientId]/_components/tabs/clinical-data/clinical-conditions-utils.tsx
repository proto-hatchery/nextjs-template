import type {
  PatientClinicalCondition,
  PatientClinicalMedication,
} from "@workspace/supabase-data/types/entities";
import { AlertTriangle, Brain, Pill, Stethoscope, User } from "lucide-react";
import type { ReactNode } from "react";

export interface ConditionListItem {
  id: string;
  kind: "condition" | "medication";
  title: string;
  subtitle?: string;
  statusLabel?: string;
  badge?: string;
  meta?: string;
  source?: string;
  entityId?: string;
}

export function mapConditionToItem(condition: PatientClinicalCondition): ConditionListItem {
  const badge = condition.conditionType ? formatConditionType(condition.conditionType) : undefined;
  const diagnosed = condition.diagnosedDate
    ? `Diagnóstico: ${formatDateShort(condition.diagnosedDate)}`
    : undefined;
  return {
    id: `condition-${condition.id}`,
    kind: "condition",
    title: condition.name,
    ...([badge, diagnosed].filter(Boolean).join(" • ")
      ? { subtitle: [badge, diagnosed].filter(Boolean).join(" • ") }
      : {}),
    ...(condition.status ? { statusLabel: formatStatus(condition.status) } : {}),
    ...(badge ? { badge } : {}),
    ...(condition.notes ? { meta: condition.notes } : {}),
    source: condition.source === "client_portal" ? "Paciente" : "Profissional",
    entityId: condition.id,
  };
}

export function mapMedicationToItem(medication: PatientClinicalMedication): ConditionListItem {
  const parts = [medication.dosage, medication.frequency].filter(Boolean);
  if (medication.startDate) parts.push(`Início ${formatDateShort(medication.startDate)}`);
  if (medication.endDate) parts.push(`Fim ${formatDateShort(medication.endDate)}`);
  const statusLabel = medication.isActive === false ? "Encerrada" : "Ativa";
  const meta = medication.reason ?? medication.notes;
  return {
    id: `medication-${medication.id}`,
    kind: "medication",
    title: medication.name || "Medicação",
    ...(parts.length > 0 ? { subtitle: parts.join(" • ") } : {}),
    statusLabel,
    ...(typeof meta === "string" && meta !== "" ? { meta } : {}),
    source: medication.source === "client_portal" ? "Paciente" : "Profissional",
    entityId: medication.id,
  };
}

export function formatConditionType(value: string): string {
  const map: Record<string, string> = {
    mental_disorder: "Transtorno mental",
    chronic_pain: "Dor crônica",
    physical_condition: "Condição física",
    chronic_disease: "Doença crônica",
    physical_disability: "Deficiência física",
  };
  return map[value] ?? value;
}

export function formatStatus(status: string): string {
  const map: Record<string, string> = {
    active: "Ativa",
    resolved: "Resolvida",
    managed: "Controlada",
  };
  return map[status] ?? status;
}

export function pickConditionIcon(kind: ConditionListItem["kind"], badge?: string): ReactNode {
  if (kind === "medication") return <Pill className="size-5 text-muted-foreground" />;
  if (badge === "Transtorno mental") return <Brain className="size-5 text-muted-foreground" />;
  if (badge === "Dor crônica") return <AlertTriangle className="size-5 text-muted-foreground" />;
  if (badge === "Condição física") return <User className="size-5 text-muted-foreground" />;
  return <Stethoscope className="size-5 text-muted-foreground" />;
}

export function formatDateShort(value?: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
