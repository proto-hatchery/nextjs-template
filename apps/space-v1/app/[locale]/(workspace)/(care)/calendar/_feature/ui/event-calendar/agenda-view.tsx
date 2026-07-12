"use client";

import { RiCalendarEventLine } from "@remixicon/react";
import { addDays, format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo } from "react";

import { AgendaDaysToShow } from "./constants";
import type { CalendarEvent } from "./types";
import { EventItem } from "./event-item";
import { getAgendaEventsForDay } from "./utils";
import { normalizeTimezone, nowInTimezone } from "@workspace/ui/lib/timezone-datetime";

interface AgendaViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent, triggerElement?: HTMLElement) => void;
  timezone?: string;
}

export function AgendaView({ currentDate, events, onEventSelect, timezone }: AgendaViewProps) {
  const resolvedTimezone = normalizeTimezone(timezone);
  const todayInUserTimezone = useMemo(() => nowInTimezone(resolvedTimezone), [resolvedTimezone]);

  // Show events for the next days based on constant
  const days = useMemo(() => {
    return Array.from({ length: AgendaDaysToShow }, (_, i) => addDays(new Date(currentDate), i));
  }, [currentDate]);

  const handleEventClick = (
    event: CalendarEvent,
    e: React.MouseEvent,
    triggerElement?: HTMLElement,
  ) => {
    e.stopPropagation();
    onEventSelect(event, triggerElement);
  };

  // Check if there are any days with events
  const hasEvents = days.some((day) => getAgendaEventsForDay(events, day).length > 0);

  return (
    <div className="h-full overflow-y-auto scrollbar-none border-border/70 border-t px-4">
      {!hasEvents ? (
        <div className="flex min-h-[70svh] flex-col items-center justify-center py-16 text-center">
          <RiCalendarEventLine className="mb-2 text-muted-foreground/50" size={32} />
          <h3 className="font-medium text-lg">Nenhum evento encontrado</h3>
          <p className="text-muted-foreground">Não há eventos agendados para este período.</p>
        </div>
      ) : (
        days.map((day) => {
          const dayEvents = getAgendaEventsForDay(events, day);

          if (dayEvents.length === 0) return null;

          return (
            <div className="relative my-12 border-border/70 border-t" key={day.toString()}>
              <span
                className="-top-3 absolute left-0 flex h-6 items-center bg-background pe-4 text-[10px] uppercase data-today:font-medium sm:pe-4 sm:text-xs"
                data-today={isSameDay(day, todayInUserTimezone) || undefined}
              >
                {format(day, "d MMM, EEEE", { locale: ptBR })}
              </span>
              <div className="mt-6 space-y-2">
                {dayEvents.map((event) => (
                  <EventItem
                    event={event}
                    key={event.id}
                    onClick={(e, triggerEl) => handleEventClick(event, e, triggerEl)}
                    timezone={resolvedTimezone}
                    view="agenda"
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
