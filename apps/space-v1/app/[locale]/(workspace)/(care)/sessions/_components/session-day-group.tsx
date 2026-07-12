"use client";

import type { SessionWithDetails } from "@workspace/supabase-data/types/entities";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { SessionTimelineCard } from "./session-timeline-card";

interface SessionDayGroupProps {
  date: Date;
  sessions: SessionWithDetails[];
  timelineColor: "blue" | "green";
}

export function SessionDayGroup({ date, sessions, timelineColor }: SessionDayGroupProps) {
  // eeeeee = short abbreviation (mon, tue, wed, thu, fri, sat, sun)
  // Capitalize only the first letter of the weekday
  const dayOfWeek = format(date, "eeeeee", { locale: ptBR });
  const restOfDate = format(date, "dd 'de' MMM 'de' yyyy", { locale: ptBR });
  const formattedDate = `${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)}, ${restOfDate}`;

  return (
    <div className="relative">
      {/* Desktop: layout with sticky date on the left */}
      <div className="hidden md:flex gap-0">
        {/* Sticky Date Header - on the left */}
        <div className="sticky top-0 flex-shrink-0 w-48 self-start">
          <h3 className="text-sm font-medium text-gray-900">{formattedDate}</h3>
        </div>

        {/* Sessions for this day - on the right */}
        <div className="flex-1 space-y-4">
          {sessions.map((session, index) => (
            <SessionTimelineCard
              key={session.id}
              session={session}
              isFirst={index === 0}
              isLast={index === sessions.length - 1}
              timelineColor={timelineColor}
            />
          ))}
        </div>
      </div>

      {/* Mobile: layout with inline date and full-width cards */}
      <div className="md:hidden space-y-2">
        {/* Date header takes full row */}
        <h3 className="text-sm font-medium text-gray-900 mb-2">{formattedDate}</h3>

        {/* Sessions stacked with reduced gap */}
        <div className="space-y-2">
          {sessions.map((session, index) => (
            <SessionTimelineCard
              key={session.id}
              session={session}
              isFirst={index === 0}
              isLast={index === sessions.length - 1}
              timelineColor={timelineColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
