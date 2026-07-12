"use client";

import type { PatientClinicalData } from "@workspace/supabase-data/types/entities";
import { useClinicalNotesByPatient } from "@workspace/supabase-data/hooks/notes";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";

import { PatientDetailCardLoadingState } from "../../shared/patient-detail-card-states";
import { PatientDetailSubheader } from "../../shared/patient-detail-subheader";

interface PatientClinicalPreliminaryInfoProps {
  patientId: string;
  clinicalData: PatientClinicalData;
}

export function PatientClinicalPreliminaryInfo({ patientId }: PatientClinicalPreliminaryInfoProps) {
  const router = useRouter();

  // Busca notas clínicas do paciente
  const { data: clinicalNotes, isPending } = useClinicalNotesByPatient(patientId);

  const recentNote = clinicalNotes?.[0] ?? null;

  return (
    <section className="space-y-6">
      <div className="space-y-4">
        <PatientDetailSubheader title="Notas clínicas" />
        {isPending ? (
          <PatientDetailCardLoadingState message="Carregando..." />
        ) : recentNote?.id ? (
          <ClinicalNotePreview
            icon={FileText}
            title={recentNote.title ?? "Nota sem título"}
            description="Clique para visualizar/editar"
            updatedAt={recentNote.updated_at}
            onViewClick={() => router.push(`/notes/${recentNote.id}`)}
          />
        ) : (
          <ClinicalNoteEmptyState
            icon={FileText}
            title="Nenhuma nota clínica registrada"
            description="Clique para criar uma nova nota clínica para este paciente."
            onCreateClick={() => router.push(`/notes/new?patientId=${patientId}`)}
          />
        )}
      </div>
    </section>
  );
}

interface ClinicalNotePreviewProps {
  icon: React.ElementType;
  title: string;
  description: string;
  updatedAt: string | null;
  onViewClick: () => void;
}

const weekDaysPt = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const monthsPt = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

function formatTimeAgo(dateString: string | null | undefined): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = diffMs / 1000;
  const diffMinutes = diffSeconds / 60;
  const diffHours = diffMinutes / 60;
  const diffDays = diffHours / 24;

  if (diffMinutes < 1) return "há alguns segundos";
  if (diffMinutes < 60) {
    const m = Math.floor(diffMinutes);
    return `há ${m} ${m === 1 ? "minuto" : "minutos"}`;
  }
  if (diffHours < 24) {
    const h = Math.floor(diffHours);
    return `há ${h} ${h === 1 ? "hora" : "horas"}`;
  }

  if (diffDays < 2) {
    return "há 1 dia";
  }

  if (diffDays < 7) {
    const d = Math.floor(diffDays);
    return `há ${d} dias`;
  }

  const dayOfWeek = weekDaysPt[date.getDay()];
  const day = date.getDate();
  const month = monthsPt[date.getMonth()];

  return `${dayOfWeek}, ${day} de ${month}`;
}

function ClinicalNotePreview({
  icon: Icon,
  title,
  description,
  updatedAt,
  onViewClick,
}: ClinicalNotePreviewProps) {
  const timeAgo = formatTimeAgo(updatedAt);

  return (
    <div
      className="group flex w-full cursor-pointer items-center gap-4 rounded-2xl bg-muted/40 p-4 transition-colors hover:bg-muted/60"
      onClick={onViewClick}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background/80 shadow-sm">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-foreground truncate">{title}</h3>
        <div className="mt-0.5 flex items-center gap-2">
          <p className="text-xs text-muted-foreground">{description}</p>
          {timeAgo && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface ClinicalNoteEmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onCreateClick: () => void;
}

function ClinicalNoteEmptyState({
  icon: Icon,
  title,
  description,
  onCreateClick,
}: ClinicalNoteEmptyStateProps) {
  return (
    <div
      className="flex min-h-[120px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl bg-muted/20 py-8 text-center transition-colors hover:bg-muted/30"
      onClick={onCreateClick}
    >
      <Icon className="size-10 text-muted-foreground/40 mb-2" />
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground/80">{description}</p>
    </div>
  );
}
