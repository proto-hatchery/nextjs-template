"use client";

interface StatusBadgeProps {
  status?: string | null;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status?.toLowerCase() ?? "default";
  const palette = STATUS_BADGE_STYLES[normalized] ??
    STATUS_BADGE_STYLES.default ?? { badge: "", dot: "" };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${palette.badge}`}
    >
      <span className={`size-1.5 rounded-full ${palette.dot}`} />
      {formatPatientStatus(status)}
    </span>
  );
}

const STATUS_BADGE_STYLES: Record<
  string,
  {
    badge: string;
    dot: string;
  }
> = {
  active: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  inactive: { badge: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
  on_break: { badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  discharged: { badge: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500" },
  pending_client_registration: {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  pending_invite_acceptance: {
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  pending_data_completion: {
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
    dot: "bg-yellow-500",
  },
  pending_patient_link: {
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
  default: { badge: "bg-muted text-muted-foreground border-muted", dot: "bg-muted-foreground" },
};

export function formatLastUpdated(lastUpdated?: string) {
  if (!lastUpdated) return "Atualização indisponível";
  const date = new Date(lastUpdated);
  if (Number.isNaN(date.getTime())) return "Atualização indisponível";
  return `Última atualização: ${date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`;
}

function getCompletionStatus(percentage: number): "complete" | "partial" | "critical" {
  if (percentage >= 80) return "complete";
  if (percentage >= 60) return "partial";
  return "critical";
}

function completionStatusLabel(percentage: number) {
  if (percentage >= 80) return "Completo";
  if (percentage >= 60) return "Parcial";
  return "Crítico";
}

interface CadastroBadgeProps {
  percentage: number;
}

export function CadastroBadge({ percentage }: CadastroBadgeProps) {
  const status = getCompletionStatus(percentage);
  const label = completionStatusLabel(percentage);

  const palette: Record<string, string> = {
    complete: "bg-emerald-50 text-emerald-700",
    partial: "bg-amber-50 text-amber-700",
    critical: "bg-rose-50 text-rose-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${palette[status]}`}
    >
      <span className="text-[10px] uppercase tracking-wide">Cadastro</span>
      <span className="text-xs font-semibold">{label}</span>
    </span>
  );
}

// Helper function to format patient status (was imported from enum-formatters)
export function formatPatientStatus(status?: string | null) {
  if (!status) return "Status desconhecido";

  const map: Record<string, string> = {
    active: "Ativo",
    inactive: "Inativo",
    on_break: "Em pausa",
    discharged: "Alta",
    pending_client_registration: "Pendente de cadastro",
    pending_invite_acceptance: "Convite pendente",
    pending_data_completion: "Dados incompletos",
    pending_patient_link: "Vínculo pendente",
  };

  return map[status.toLowerCase()] ?? status;
}
