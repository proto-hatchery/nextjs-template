"use client";

import type { SessionWithDetails } from "@workspace/supabase-data/types/entities";
import { usePsychologistTimezone } from "@workspace/supabase-data/hooks/psychologists/use-psychologist-queries";
import { cancelSessionAction } from "@workspace/supabase-data/actions/sessions/cancel-session";
import { deleteSessionAction } from "@workspace/supabase-data/actions/sessions/delete-session";
import { markSessionNoShowAction } from "@workspace/supabase-data/actions/sessions/mark-session-no-show";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { utcIsoToWallClockDate } from "@workspace/ui/lib/timezone-datetime";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { UserAvatar } from "@workspace/brand/patterns/user-avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, CheckCircle, MapPin, MoreHorizontal, Trash2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { SessionActionSheet } from "./session-action-sheet";
import { SessionClinicalNoteButton } from "./session-clinical-note-button";
import { SessionLocationDialog } from "./session-location-dialog";
import { type SessionStatus, SessionStatusBadge } from "./session-status-badge";
import { SessionStatusUpdateDialog } from "./session-status-update-dialog";

interface SessionTimelineCardProps {
  session: SessionWithDetails;
  isFirst: boolean;
  isLast: boolean;
  timelineColor: "blue" | "green";
}

export function SessionTimelineCard({
  session,
  isFirst: _isFirst,
  isLast: _isLast,
  timelineColor: _timelineColor,
}: SessionTimelineCardProps) {
  const sessionId = session.id ?? "";
  const userTimezone = usePsychologistTimezone();
  const normalizeStatus = (value: string | null | undefined): SessionStatus => {
    if (
      value === "scheduled" ||
      value === "open" ||
      value === "completed" ||
      value === "cancelled" ||
      value === "no_show"
    ) {
      return value;
    }
    return "scheduled";
  };

  const startDate = session.start_time
    ? utcIsoToWallClockDate(session.start_time, userTimezone)
    : null;
  const endDate =
    startDate && session.duration_minutes
      ? new Date(startDate.getTime() + session.duration_minutes * 60000)
      : null;
  const isValidDate = startDate && !Number.isNaN(startDate.getTime());
  const status: SessionStatus = normalizeStatus(session.status);

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
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

  const _handleNoShow = async () => {
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

  const startTime =
    isValidDate && startDate ? format(startDate, "HH:mm", { locale: ptBR }) : "--:--";
  const endTime = endDate ? format(endDate, "HH:mm", { locale: ptBR }) : "--:--";

  return (
    <div className="w-full">
      {/* Card com largura limitada no desktop, full width no mobile */}
      <div
        className={`
          w-full md:max-w-xl bg-muted/50 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden
          md:cursor-default cursor-pointer active:scale-[0.98] md:active:scale-100
        `}
        onClick={(e) => {
          // Only on mobile and if not clicking on a button
          if (window.innerWidth < 768 && !(e.target as HTMLElement).closest("button")) {
            setIsActionSheetOpen(true);
          }
        }}
      >
        <div className="flex gap-3 md:gap-4 p-3 md:p-5">
          {/* Avatar - menor no mobile */}
          <div className="shrink-0">
            <UserAvatar
              name={session.patientName}
              className="h-10 w-10 md:h-12 md:w-12 rounded-xl"
            />
          </div>

          {/* Content - all aligned to the right of avatar */}
          <div className="flex-1 min-w-0 space-y-2 md:space-y-3">
            {/* Nome e Status */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 text-sm md:text-base leading-tight">
                  {session.patientName}
                </h3>
                <div className="flex items-center gap-2 mt-0.5 md:mt-1">
                  <span className="text-xs md:text-sm text-gray-600">
                    {startTime} - {endTime}
                  </span>
                </div>
              </div>
              <SessionStatusBadge status={status} />
            </div>

            {/* Session information */}
            <div className="space-y-1.5 md:space-y-2">
              {/* Service and Location on the same line */}
              <div className="flex items-center gap-2 flex-wrap">
                {session.serviceName && (
                  <span className="text-xs md:text-sm text-gray-700">{session.serviceName}</span>
                )}
                {session.serviceName && <span className="text-xs md:text-sm text-gray-400">•</span>}
                <span className="text-xs md:text-sm text-gray-600">
                  {!session.location_id
                    ? "Online"
                    : (session.locationName ?? "Local não especificado")}
                </span>
              </div>
            </div>

            {/* Action buttons - bottom right corner */}
            <div className="flex items-center justify-end gap-1.5 md:gap-2 pt-1 md:pt-2">
              {/* Mobile: Single button to open action sheet */}
              <BrandButton
                variant="secondary"
                size="sm"
                className="md:hidden"
                onClick={() => setIsActionSheetOpen(true)}
              >
                Ações
              </BrandButton>

              {/* Desktop: Individual action buttons */}
              <div className="hidden md:flex items-center gap-2">
                {/* Status Button */}
                <BrandButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsStatusDialogOpen(true)}
                  disabled={status === "cancelled"}
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                  Status
                </BrandButton>

                {/* Notes Button */}
                <BrandButton
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  asChild
                >
                  <div>
                    <SessionClinicalNoteButton
                      sessionId={sessionId}
                      patientId={session.psychologist_patient_id}
                      patientName={session.patientName}
                      variant="compact"
                    />
                  </div>
                </BrandButton>

                {/* Menu 3 pontos */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <BrandButton variant="secondary" size="icon-sm">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Mais ações</span>
                    </BrandButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Mais Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => setIsLocationDialogOpen(true)}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Mudar Local
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" disabled>
                      <Calendar className="mr-2 h-4 w-4" />
                      Solicitar Reagendamento
                    </DropdownMenuItem>
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
                      onClick={handleDelete}
                      disabled={isMutating || (status !== "scheduled" && status !== "cancelled")}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir Sessão
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Action Sheet */}
      <SessionActionSheet
        session={session}
        open={isActionSheetOpen}
        onOpenChange={setIsActionSheetOpen}
      />

      {/* Desktop: Status Dialog */}
      <SessionStatusUpdateDialog
        session={session}
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
      />

      {/* Desktop: Location Dialog */}
      <SessionLocationDialog
        session={session}
        open={isLocationDialogOpen}
        onOpenChange={setIsLocationDialogOpen}
      />
    </div>
  );
}
