"use client";

import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import React from "react";
import { useEffect, useMemo, useState } from "react";

import type { CalendarEvent } from "./types";
import { DraggableEvent } from "./draggable-event";
import { DroppableCell } from "./droppable-cell";
import { EventGap, EventHeight } from "./constants";
import { EventItem } from "./event-item";
import { getAllEventsForDay, getEventsForDay, getSpanningEventsForDay, sortEvents } from "./utils";
import { useEventVisibility } from "./hooks/use-event-visibility";
import { DefaultStartHour } from "./constants";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { normalizeTimezone, nowInTimezone } from "@workspace/ui/lib/timezone-datetime";
import { MonthCell } from "./month-cell";
import { MobileDayEventsSheet } from "./mobile-day-events-sheet";

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent, triggerElement?: HTMLElement) => void;
  onEventCreate: (startTime: Date) => void;
  timezone?: string;
}

export function MonthView({
  currentDate,
  events,
  onEventSelect,
  onEventCreate,
  timezone,
}: MonthViewProps) {
  const isMobile = useIsMobile();
  const resolvedTimezone = normalizeTimezone(timezone);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isDaySheetOpen, setIsDaySheetOpen] = useState(false);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ end: calendarEnd, start: calendarStart });
  }, [currentDate]);

  const weekdays = useMemo(() => {
    const referenceDate = nowInTimezone(resolvedTimezone);
    return Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(startOfWeek(referenceDate, { weekStartsOn: 0 }), i);

      let dayAbbr = format(date, "EEE", { locale: ptBR });

      if (dayAbbr.length > 4) {
        dayAbbr = dayAbbr.substring(0, 3);
      }

      dayAbbr = dayAbbr.replace(/\.$/, "");

      return dayAbbr.charAt(0).toUpperCase() + dayAbbr.slice(1).toLowerCase();
    });
  }, [resolvedTimezone]);

  const weeks = useMemo(() => {
    const result = [];
    let week = [];

    for (let i = 0; i < days.length; i++) {
      week.push(days[i]);
      if (week.length === 7 || i === days.length - 1) {
        result.push(week);
        week = [];
      }
    }

    return result;
  }, [days]);

  const [isMounted, setIsMounted] = useState(false);
  const { contentRef, getVisibleEventCount } = useEventVisibility({
    eventGap: EventGap,
    eventHeight: EventHeight,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMobileDaySelect = (day: Date) => {
    setSelectedDay(day);
    setIsDaySheetOpen(true);
  };

  return (
    <div className="flex h-full flex-col" data-slot="month-view">
      <div className="h-10 grid grid-cols-7 border-border/70 border-b">
        {weekdays.map((day, index) => {
          const isWeekend = index === 0 || index === 6;
          return (
            <div
              className={`flex items-center justify-end text-center text-sm font-medium pr-2 ${
                isWeekend ? "text-muted-foreground/70" : "text-foreground"
              }`}
              key={day}
            >
              {day}
            </div>
          );
        })}
      </div>
      <div className="min-h-0 flex-1">
        <div
          className="grid h-full grid-cols-7"
          style={{ gridTemplateRows: `repeat(${weeks.length}, minmax(0, 1fr))` }}
        >
          {weeks.map((week, weekIndex) => (
            <React.Fragment key={`week-${week}`}>
              {week.map((day, dayIndex) => {
                if (!day) return null; // Skip if day is undefined

                const isReferenceCell = weekIndex === 0 && dayIndex === 0;

                // Calculate visible count for this cell
                const allDayEvents = [
                  ...getSpanningEventsForDay(events, day),
                  ...getEventsForDay(events, day),
                ];
                const visibleCount = isMounted
                  ? getVisibleEventCount(allDayEvents.length)
                  : undefined;

                return (
                  <MonthCell
                    key={day.toISOString()}
                    day={day}
                    date={currentDate}
                    events={events}
                    onEventSelect={onEventSelect}
                    onEventCreate={onEventCreate}
                    onMobileDaySelect={handleMobileDaySelect}
                    isMounted={isMounted}
                    {...(visibleCount !== undefined ? { visibleCount } : {})}
                    {...(isReferenceCell ? { measureRef: contentRef } : {})}
                    timezone={resolvedTimezone}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <MobileDayEventsSheet
        open={isDaySheetOpen}
        onOpenChange={setIsDaySheetOpen}
        date={selectedDay}
        events={selectedDay ? getAllEventsForDay(events, selectedDay) : []}
        timezone={resolvedTimezone}
        onEventSelect={onEventSelect}
      />
    </div>
  );
}
