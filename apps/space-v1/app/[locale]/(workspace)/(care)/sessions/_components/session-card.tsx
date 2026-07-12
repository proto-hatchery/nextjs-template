"use client";

import type { SessionWithDetails } from "@workspace/supabase-data/types/entities";
import { usePsychologistTimezone } from "@workspace/supabase-data/hooks/psychologists/use-psychologist-queries";
import { cancelSessionAction } from "@workspace/supabase-data/actions/sessions/cancel-session";
import { deleteSessionAction } from "@workspace/supabase-data/actions/sessions/delete-session";
import { markSessionNoShowAction } from "@workspace/supabase-data/actions/sessions/mark-session-no-show";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { Badge } from "@workspace/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { utcIsoToWallClockDate } from "@workspace/ui/lib/timezone-datetime";
import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { Sensitive } from "@workspace/core/privacy/sensitive";
import { UserAvatar } from "@workspace/brand/patterns/user-avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  CheckCircle2,
  ExternalLink,
  MapPin,
  MoreHorizontal,
  Trash2,
  UserX,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { SessionClinicalNoteButton } from "./session-clinical-note-button";
import { SessionStatusUpdateDialog } from "./session-status-update-dialog";

interface SessionCardProps {
  session: SessionWithDetails;
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendada",
  open: "Aberta",
  completed: "Concluída",
  cancelled: "Cancelada",
  no_show: "Não Compareceu",
};

const STATUS_STYLES: Record<string, string> = {
  scheduled: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
  open: "border-transparent bg-primary/10 text-primary hover:bg-primary/20",
  completed: "border-transparent bg-green-500/15 text-green-700 hover:bg-green-500/25",
  cancelled: "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20",
  no_show: "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20",
};

export function SessionCard({ session }: SessionCardProps) {
  const sessionId = session.id ?? "";
  const userTimezone = usePsychologistTimezone();
  const startDate = session.start_time
    ? utcIsoToWallClockDate(session.start_time, userTimezone)
    : null;
  const isValidDate = startDate && !Number.isNaN(startDate.getTime());
  const duration = session.duration_minutes ?? 0;
  const status = session.status ?? "scheduled";

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    setIsMutating(true);
    try {
      unwrapActionResult(
        await cancelSessionAction({ sessionId, reason: "Cancelada pelo profissional" }),
      );
      toast.success("Sessão cancelada");
      router.refresh();
    } catch {
      toast.error("Erro ao cancelar sessão");
    } finally {
      setIsMutating(false);
    }
  };

  const handleNoShow = async () => {
    setIsMutating(true);
    try {
      unwrapActionResult(await markSessionNoShowAction({ sessionId }));
      toast.success("Sessão marcada como não comparecimento");
      router.refresh();
    } catch {
      toast.error("Erro ao marcar sessão");
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = () => {
    if (
      !window.confirm(
        "Tem certeza que deseja EXCLUIR esta sessão? Esta ação irá remover completamente a sessão, a cobrança e o evento do calendário. Use 'Cancelar' se quiser manter o registro.",
      )
    ) {
      return;
    }

    void (async () => {
      setIsMutating(true);
      try {
        unwrapActionResult(await deleteSessionAction({ sessionId }));
        toast.success("Sessão excluída com sucesso");
        router.refresh();
      } catch {
        toast.error("Erro ao excluir sessão");
      } finally {
        setIsMutating(false);
      }
    })();
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm transition-all hover:shadow-md overflow-hidden">
      {/* Header: Date, Time & Status */}
      <div className="p-4 flex items-start justify-between gap-4 border-b">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-primary/5 text-primary rounded-md shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">
                {isValidDate && startDate
                  ? format(startDate, "dd 'de' MMMM, yyyy", { locale: ptBR })
                  : "Data não definida"}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-muted-foreground">
                {isValidDate && startDate ? format(startDate, "EEEE", { locale: ptBR }) : ""}
                {isValidDate && startDate && " • "}
                {isValidDate && startDate ? format(startDate, "HH:mm", { locale: ptBR }) : "--:--"}
                {" • "}
                {duration} min
              </p>
            </div>
          </div>
        </div>
        <Badge
          variant="secondary"
          className={cn(
            "px-2 py-0.5 text-xs font-medium select-none shadow-none shrink-0",
            STATUS_STYLES[status],
          )}
        >
          {STATUS_LABELS[status] ?? status}
        </Badge>
      </div>

      {/* Patient Info */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Sensitive variant="blur" redactedLabel="Avatar oculto">
            <UserAvatar
              name={session.patientName}
              className="h-10 w-10 rounded-full ring-2 ring-background shadow-sm shrink-0"
              fallbackClassName="bg-primary/5 text-primary font-medium"
            />
          </Sensitive>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground tracking-tight truncate">
                <Sensitive variant="blur" redactedLabel="Nome do paciente oculto">
                  {session.patientName}
                </Sensitive>
              </h3>
              {session.psychologist_patient_id && (
                <BrandButton
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-primary shrink-0"
                  asChild
                >
                  <Link href={`/patients/${session.psychologist_patient_id}`}>
                    <ExternalLink className="h-3 w-3" />
                    <span className="sr-only">Ver perfil do paciente</span>
                  </Link>
                </BrandButton>
              )}
            </div>
            {session.serviceName && (
              <p className="text-xs text-muted-foreground truncate">{session.serviceName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Location & Meeting Link */}
      {session.locationName && (
        <div className="px-4 py-3 bg-muted/20 space-y-2">
          <Sensitive variant="blur" redactedLabel="Localização oculta">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-foreground font-medium truncate">{session.locationName}</span>
            </div>
          </Sensitive>
        </div>
      )}

      {/* Action Buttons Footer */}
      <div className="p-3 bg-muted/30 border-t flex gap-2">
        <BrandButton
          variant="neutral"
          size="small"
          className="flex-1 justify-start gap-2 h-10 rounded-full font-medium"
          onClick={(e) => {
            // Handled by child component
            e.preventDefault();
          }}
          asChild
        >
          <div className="cursor-pointer">
            <SessionClinicalNoteButton
              sessionId={sessionId}
              patientId={session.psychologist_patient_id}
              patientName={session.patientName}
              variant="compact"
            />
          </div>
        </BrandButton>

        <BrandButton
          variant="neutral"
          size="small"
          className="flex-1 justify-start gap-2 h-10 rounded-full font-medium"
          onClick={() => setIsStatusDialogOpen(true)}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-xs font-medium">Status</span>
        </BrandButton>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <BrandButton
              variant="neutral"
              size="small"
              className="flex-1 justify-start gap-2 h-10 rounded-full font-medium"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="text-xs font-medium">Mais</span>
            </BrandButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => void handleCancel()}
              disabled={
                isMutating ||
                status === "cancelled" ||
                status === "completed" ||
                status === "no_show"
              }
              className="text-orange-600 focus:text-orange-600 cursor-pointer"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancelar Sessão
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => void handleNoShow()}
              disabled={
                isMutating ||
                status === "cancelled" ||
                status === "completed" ||
                status === "no_show"
              }
              className="cursor-pointer"
            >
              <UserX className="mr-2 h-4 w-4" />
              Não Compareceu
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isMutating || (status !== "scheduled" && status !== "cancelled")}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir Sessão
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              Reagendar (em breve)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status Update Dialog */}
      <SessionStatusUpdateDialog
        session={session}
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
      />
    </div>
  );
}
