"use client";

import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as React from "react";

import { type CalendarEvent } from "./types";
import { EventItem } from "./event-item";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@workspace/ui/components/sheet";

interface MobileDayEventsSheetProps {
  date: Date | null;
  events: CalendarEvent[];
  timezone?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventSelect: (event: CalendarEvent, triggerElement?: HTMLElement) => void;
}

export function MobileDayEventsSheet({
  date,
  events,
  timezone,
  open,
  onOpenChange,
  onEventSelect,
}: MobileDayEventsSheetProps) {
  if (!date) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[50vh] sm:h-[60vh] p-0 flex flex-col rounded-t-[10px]"
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle>{format(date, "d 'de' MMMM", { locale: ptBR })}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {events.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">Nenhum evento neste dia</div>
          ) : (
            events.map((event) => {
              const eventStart = new Date(event.start);
              const eventEnd = new Date(event.end);
              const isFirstDay = isSameDay(date, eventStart);
              const isLastDay = isSameDay(date, eventEnd);

              return (
                <div
                  key={event.id}
                  onClick={() => {
                    onEventSelect(event);
                    onOpenChange(false);
                  }}
                  className="cursor-pointer active:opacity-70 transition-opacity"
                >
                  <EventItem
                    event={event}
                    isFirstDay={isFirstDay}
                    isLastDay={isLastDay}
                    {...(timezone !== undefined ? { timezone } : {})}
                    view="agenda"
                  />
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
