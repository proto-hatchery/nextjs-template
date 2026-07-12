"use client";

import type { ClinicalSessionStatus, PaymentStatus } from "@workspace/supabase-data/types/entities";
import { Badge } from "@workspace/ui/components/badge";
import { Table, TableBody, TableCell, TableRow } from "@workspace/ui/components/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { utcIsoToWallClockDate } from "@workspace/ui/lib/timezone-datetime";
import { cn } from "@workspace/ui/lib/utils";
import { UserAvatar } from "@workspace/brand/patterns/user-avatar";
import { Check, CheckCircle2, DollarSign, MapPin, Send, Video } from "lucide-react";
import * as React from "react";

import type { UpcomingSession } from "../types/session";
import { UpcomingSessionCard } from "./upcoming-session-card";

function formatSessionDateTime(
  iso: string,
  baseNow: Date,
  timezone?: string,
): { dateLabel: string; timeLabel: string } {
  const d = utcIsoToWallClockDate(iso, timezone);
  const base = new Date(baseNow.getFullYear(), baseNow.getMonth(), baseNow.getDate());
  const diffDays = Math.floor((d.getTime() - base.getTime()) / 86400000);

  // d is a wall-clock Date in the profile timezone — use getHours/getMinutes directly
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const time = `${hh}h${mm === "00" ? "" : mm}`;

  let dateLabel: string;
  if (diffDays === 0) {
    dateLabel = "Hoje";
  } else if (diffDays === 1) {
    dateLabel = "Amanhã";
  } else {
    // Format as "23/07" for dates beyond tomorrow
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    dateLabel = `${day}/${month}`;
  }

  return { dateLabel, timeLabel: time };
}

function getSessionStatusLabel(status: ClinicalSessionStatus): string {
  switch (status) {
    case "scheduled":
      return "Agendada";
    case "open":
      return "Em aberto";
    case "completed":
      return "Realizada";
    case "cancelled":
      return "Cancelada";
    case "no_show":
      return "Não compareceu";
    default:
      return status;
  }
}

// Background colors updated to align with design (more subtle, rounded)
const sessionStatusBgColors: Record<ClinicalSessionStatus, string> = {
  scheduled: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300",
  open: "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300",
  confirmed: "bg-sky-100 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300",
  in_progress: "bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300",
  completed: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300",
  cancelled: "bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300",
  no_show: "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300",
  rescheduled: "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300",
};

function getPaymentStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case "pending":
      return "Pendente";
    case "paid":
      return "Pago";
    case "overdue":
      return "Atrasado";
    case "refunded":
      return "Reembolsado";
    case "cancelled":
      return "Cancelado";
    default:
      return status;
  }
}

function formatCurrency(value: number) {
  // Convert from cents to reais
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

interface UpcomingSessionsTableProps {
  sessions: UpcomingSession[];
  now: Date;
  timezone?: string;
}

export function UpcomingSessionsTable({ sessions, now, timezone }: UpcomingSessionsTableProps) {
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(() => new Set());

  const toggleRowSelection = React.useCallback((id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  if (sessions.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed text-center">
        <p className="text-muted-foreground text-sm">
          Nenhuma sessão encontrada com os filtros atuais.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Card List */}
      <div className="md:hidden space-y-1">
        {sessions.map((session) => (
          <UpcomingSessionCard
            key={session.id}
            session={session}
            now={now}
            {...(timezone !== undefined ? { timezone } : {})}
            onClick={() => toggleRowSelection(session.id)}
          />
        ))}
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:flex flex-col rounded-xl border bg-card overflow-hidden">
        <div className="overflow-hidden">
          <Table className="[&>tbody>tr]:align-middle">
            <TableBody>
              {sessions.map((s) => {
                const { dateLabel, timeLabel } = formatSessionDateTime(s.timeISO, now, timezone);
                const venueName =
                  s.location ?? (s.sessionType === "online" ? "Consultório Virtual" : "—");
                const isSelected = selectedRows.has(s.id);

                return (
                  <TableRow
                    key={s.id}
                    data-selected={isSelected}
                    className={cn(
                      "transition-colors hover:bg-muted/30 group/row cursor-pointer relative border-b last:border-0",
                      isSelected && "bg-primary/5 ring-1 ring-primary/40",
                    )}
                    onClick={() => toggleRowSelection(s.id)}
                  >
                    {/* Avatar & Identifiers Column - Compact */}
                    <TableCell className="w-full md:w-[220px] py-4 pl-4 pr-2">
                      <div className="flex items-center gap-3">
                        <div className="group relative shrink-0">
                          <UserAvatar
                            name={s.clientName}
                            avatarUrl={s.avatarUrl ?? null}
                            className="h-10 w-10 md:h-10 md:w-10"
                          />
                          <div
                            role="button"
                            aria-label={isSelected ? "Desmarcar paciente" : "Selecionar paciente"}
                            aria-pressed={isSelected}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleRowSelection(s.id);
                            }}
                            className={cn(
                              "absolute inset-0 flex items-center justify-center rounded-full transition-all duration-200",
                              isSelected
                                ? "bg-primary/70 text-white opacity-100"
                                : "bg-black/60 text-white/80 opacity-0 group-hover:opacity-100 md:opacity-0",
                            )}
                          >
                            <Check
                              className={cn(
                                "h-4 w-4 transition-all duration-200",
                                isSelected ? "scale-100" : "scale-75",
                              )}
                            />
                          </div>
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate text-sm md:text-base text-foreground">
                              {s.clientName}
                            </span>

                            {/* Mobile-only status indicators */}
                            <div className="flex md:hidden gap-1">
                              {s.isConfirmed && (
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              )}
                              {s.price != null && (
                                <DollarSign
                                  className={cn(
                                    "h-3 w-3",
                                    s.paymentStatus === "paid"
                                      ? "text-emerald-600"
                                      : s.paymentStatus === "overdue"
                                        ? "text-rose-600"
                                        : "text-muted-foreground/50",
                                  )}
                                />
                              )}
                            </div>
                          </div>

                          {/* Mobile-only layout stack */}
                          <div className="flex md:hidden flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                            <span>
                              {dateLabel}, {timeLabel}
                            </span>
                            <span>•</span>
                            <span
                              className={cn(
                                s.status === "cancelled" && "text-rose-600 font-medium",
                              )}
                            >
                              {getSessionStatusLabel(s.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Date/Time (Desktop only) - Compact */}
                    <TableCell className="hidden md:table-cell w-[140px] whitespace-nowrap py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium leading-none mb-1 text-foreground">
                          {dateLabel}
                        </span>
                        <span className="text-xs text-muted-foreground">{timeLabel}</span>
                      </div>
                    </TableCell>

                    {/* Location (Desktop only) - Compact */}
                    <TableCell className="hidden md:table-cell w-[180px] py-4">
                      <div className="flex items-center gap-2 min-w-0">
                        {s.sessionType === "presencial" ? (
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="text-sm truncate text-muted-foreground">{venueName}</span>
                      </div>
                    </TableCell>

                    {/* Status Badge Only Column */}
                    <TableCell className="hidden md:table-cell w-[140px] py-4">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "font-medium border-0 text-xs px-3 py-1 rounded-full",
                          sessionStatusBgColors[s.status],
                        )}
                      >
                        {getSessionStatusLabel(s.status)}
                      </Badge>
                    </TableCell>

                    {/* Actions / Indicators Column */}
                    <TableCell className="hidden md:table-cell w-[140px] py-4">
                      <div className="flex items-center gap-3">
                        {/* Confirmation Icon */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-center p-1 cursor-default">
                                <CheckCircle2
                                  className={cn(
                                    "h-5 w-5",
                                    s.isConfirmed
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-muted-foreground/30",
                                  )}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {s.isConfirmed ? "Paciente confirmado" : "Aguardando confirmação"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Reminder Icon */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-center p-1 cursor-default">
                                <Send
                                  className={cn(
                                    "h-5 w-5",
                                    s.reminderSent
                                      ? "text-blue-600 dark:text-blue-400"
                                      : "text-muted-foreground/30",
                                  )}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{s.reminderSent ? "Lembrete enviado" : "Lembrete não enviado"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Payment Icon */}
                        {s.price != null && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-center p-1 cursor-default">
                                  <DollarSign
                                    className={cn(
                                      "h-5 w-5",
                                      s.paymentStatus === "paid" &&
                                        "text-emerald-600 dark:text-emerald-400",
                                      s.paymentStatus === "overdue" &&
                                        "text-rose-600 dark:text-rose-400",
                                      s.paymentStatus === "refunded" &&
                                        "text-blue-600 dark:text-blue-400",
                                      (!s.paymentStatus || s.paymentStatus === "pending") &&
                                        "text-muted-foreground/30",
                                    )}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{getPaymentStatusLabel(s.paymentStatus ?? "pending")}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>

                    {/* Price (Desktop only) */}
                    <TableCell className="hidden md:table-cell w-[100px] text-right py-4 pr-6">
                      {s.price != null ? (
                        <span className="text-sm font-semibold text-foreground">
                          {formatCurrency(s.price)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
