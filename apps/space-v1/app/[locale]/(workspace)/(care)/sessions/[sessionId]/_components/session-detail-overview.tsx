"use client";

import type { SessionWithDetails } from "@workspace/supabase-data/types/entities";
import { usePsychologistTimezone } from "@workspace/supabase-data/hooks/psychologists/use-psychologist-queries";
import { Badge } from "@workspace/ui/components/badge";
import { Calendar } from "@workspace/ui/components/calendar";
import { utcIsoToWallClockDate } from "@workspace/ui/lib/timezone-datetime";
import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { UserAvatar } from "@workspace/brand/patterns/user-avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, ExternalLink, MapPin, User, Wallet } from "lucide-react";
import Link from "next/link";

import { SessionClinicalNoteButton } from "../../_components/session-clinical-note-button";

interface SessionDetailOverviewProps {
  session: SessionWithDetails;
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendada",
  in_preparation: "Em Preparação",
  open: "Aberta",
  completed: "Concluída",
  cancelled: "Cancelada",
  no_show: "Não Compareceu",
};

const STATUS_STYLES: Record<string, string> = {
  scheduled: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
  in_preparation: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
  open: "border-transparent bg-primary/10 text-primary hover:bg-primary/20",
  completed: "border-transparent bg-green-500/15 text-green-700 hover:bg-green-500/25",
  cancelled: "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20",
  no_show: "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20",
};

export function SessionDetailOverview({ session }: SessionDetailOverviewProps) {
  const sessionId = session.id ?? "";

  const userTimezone = usePsychologistTimezone();
  const startDate = session.start_time
    ? utcIsoToWallClockDate(session.start_time, userTimezone)
    : null;
  const isValidDate = startDate && !Number.isNaN(startDate.getTime());
  const duration = session.duration_minutes ?? 0;

  const status = session.status ?? "scheduled";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Main Content Card */}
      <div className="bg-card rounded-xl border shadow-sm divide-y">
        {/* Header: Patient & Status */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={session.patientName}
              className="h-12 w-12 rounded-full ring-2 ring-background shadow-sm"
              fallbackClassName="bg-primary/5 text-primary font-medium"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground tracking-tight">
                  {session.patientName}
                </h2>
                {session.psychologist_patient_id && (
                  <BrandButton
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-primary"
                    asChild
                  >
                    <Link href={`/patients/${session.psychologist_patient_id}`}>
                      <ExternalLink className="h-3 w-3" />
                      <span className="sr-only">Ver perfil do paciente</span>
                    </Link>
                  </BrandButton>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Paciente</p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "w-fit px-3 py-1 font-medium select-none shadow-none",
              STATUS_STYLES[status],
            )}
          >
            {STATUS_LABELS[status] ?? status}
          </Badge>
        </div>

        {/* Compact Info Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Horário e Duração
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-foreground block">
                    {isValidDate && startDate
                      ? format(startDate, "dd 'de' MMMM, yyyy", { locale: ptBR })
                      : "Data não definida"}
                  </span>
                  {isValidDate && startDate && (
                    <span className="text-muted-foreground">
                      {format(startDate, "EEEE", { locale: ptBR })}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-foreground">
                  {isValidDate && startDate
                    ? format(startDate, "HH:mm", { locale: ptBR })
                    : "--:--"}{" "}
                  - {duration} min
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Detalhes do Atendimento
            </h3>
            <div className="space-y-3">
              {session.serviceName && (
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{session.serviceName}</span>
                </div>
              )}
              {session.locationName && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{session.locationName}</span>
                </div>
              )}
              {session.price !== null && (
                <div className="flex items-center gap-3 text-sm">
                  <Wallet className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(session.price / 100)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes Action Section */}
        <div className="p-4 bg-muted/20">
          <SessionClinicalNoteButton
            sessionId={sessionId}
            patientId={session.psychologist_patient_id}
            patientName={session.patientName}
          />
        </div>
      </div>

      {/* Metadata Footer */}
      <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-widest px-2">
        <div className="flex gap-4">
          <span>ID: {sessionId.slice(0, 8)}...</span>
        </div>
        <div className="flex gap-4">
          {session.updated_at && (
            <span>
              Atualizado: {format(new Date(session.updated_at), "dd MMM HH:mm", { locale: ptBR })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
