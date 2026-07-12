"use client";

import { utcIsoToWallClockDate } from "@workspace/ui/lib/timezone-datetime";
import { cn } from "@workspace/ui/lib/utils";
import { Sensitive } from "@workspace/core/privacy/sensitive";
import { UserAvatar } from "@workspace/brand/patterns/user-avatar";
import { MapPin, Video } from "lucide-react";

import type { UpcomingSession } from "../types/session";

interface UpcomingSessionCardProps {
  session: UpcomingSession;
  now: Date;
  timezone?: string;
  onClick?: () => void;
}

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

import { BrandButton } from "@workspace/brand/components/brand-button";

export function UpcomingSessionCard({ session, now, timezone, onClick }: UpcomingSessionCardProps) {
  const { dateLabel, timeLabel } = formatSessionDateTime(session.timeISO, now, timezone);
  const venueName = session.location ?? (session.sessionType === "online" ? "Online" : "—");

  return (
    <BrandButton
      variant="ghost"
      onClick={onClick}
      className="flex items-center w-full gap-3 px-1 py-4 h-auto text-left justify-start"
    >
      {/* Avatar */}
      <div className="flex shrink-0 relative">
        <Sensitive variant="blur" redactedLabel="Avatar oculto">
          <UserAvatar
            name={session.clientName}
            avatarUrl={session.avatarUrl ?? null}
            className="h-10 w-10"
          />
        </Sensitive>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Patient Name and Status */}
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-bold text-foreground truncate tracking-tight">
            <Sensitive variant="blur" redactedLabel="Nome do cliente oculto">
              {session.clientName.toUpperCase()}
            </Sensitive>
          </span>
          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0",
              session.isConfirmed
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200",
            )}
          >
            {session.isConfirmed ? "Confirmado" : "Pendente"}
          </span>
        </div>

        {/* Session Details - Only location */}
        <div className="flex items-center gap-1 mt-0.5">
          {session.sessionType === "presencial" ? (
            <MapPin className="h-3 w-3 text-muted-foreground" />
          ) : (
            <Video className="h-3 w-3 text-muted-foreground" />
          )}
          <Sensitive variant="blur" redactedLabel="Localização oculta">
            <span className="text-sm text-muted-foreground truncate">{venueName}</span>
          </Sensitive>
        </div>
      </div>

      {/* Date and Time */}
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <span className="text-[15px] font-bold text-foreground tracking-tight">{dateLabel}</span>
        <span className="text-sm text-muted-foreground font-medium">{timeLabel}</span>
      </div>
    </BrandButton>
  );
}
