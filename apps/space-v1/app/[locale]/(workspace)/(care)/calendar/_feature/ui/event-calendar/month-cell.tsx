"use client";

import { format, isSameDay, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import React from "react";

import { type CalendarEvent } from "./types";
import { DraggableEvent } from "./draggable-event";
import { DroppableCell } from "./droppable-cell";
import { EventItem } from "./event-item";
import { getAllEventsForDay, getEventsForDay, getSpanningEventsForDay, sortEvents } from "./utils";
import { getEventColorClasses } from "./utils";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { useLongPress } from "@workspace/ui/hooks/use-long-press";
import { nowInTimezone } from "@workspace/ui/lib/timezone-datetime";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { DefaultStartHour } from "./constants";
import { EventHeight } from "./constants";

interface MonthCellProps {
  day: Date;
  date: Date; // currentDate from MonthView
  events: CalendarEvent[]; // All events
  onEventSelect: (event: CalendarEvent, triggerElement?: HTMLElement) => void;
  onEventCreate: (startTime: Date) => void;
  onMobileDaySelect: (day: Date) => void;
  isMounted: boolean;
  visibleCount?: number;
  measureRef?: React.Ref<HTMLDivElement>;
  timezone: string;
}

export function MonthCell({
  day,
  date: currentDate,
  events,
  onEventSelect,
  onEventCreate,
  onMobileDaySelect,
  isMounted,
  visibleCount,
  measureRef,
  timezone,
}: MonthCellProps) {
  const isMobile = useIsMobile();
  const nowInUserTimezone = React.useMemo(() => nowInTimezone(timezone), [timezone]);
  const dayEvents = getEventsForDay(events, day);
  const spanningEvents = getSpanningEventsForDay(events, day);
  const isCurrentMonth = isSameMonth(day, currentDate);
  // day.getDay() returns 0 for Sunday, 6 for Saturday
  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
  const cellId = `month-cell-${day.toISOString()}`;
  const allDayEvents = [...spanningEvents, ...dayEvents];
  const allEvents = getAllEventsForDay(events, day);

  const hasMore = visibleCount !== undefined && allDayEvents.length > visibleCount;
  const remainingCount = hasMore ? allDayEvents.length - visibleCount : 0;

  const handleEventClick = (
    event: CalendarEvent,
    e: React.MouseEvent,
    triggerElement?: HTMLElement,
  ) => {
    e.stopPropagation();
    onEventSelect(event, triggerElement);
  };

  const longPress = useLongPress(
    () => {
      const startTime = new Date(day);
      startTime.setHours(DefaultStartHour, 0, 0);
      onEventCreate(startTime);
    },
    { threshold: 500 },
  );

  if (isMobile) {
    return (
      <div
        className="group relative overflow-hidden border-border/70 border-r border-b [&:nth-child(7n)]:border-r-0 bg-background data-weekend-cell:bg-muted/20 data-outside-cell:opacity-55 data-outside-cell:text-muted-foreground/70"
        data-outside-cell={!isCurrentMonth || undefined}
        data-weekend-cell={isWeekend || undefined}
        data-today={isSameDay(day, nowInUserTimezone) || undefined}
      >
        <DroppableCell date={day} id={cellId} onClick={() => onMobileDaySelect(day)} {...longPress}>
          <div className="mt-1 flex justify-center">
            <div className="inline-flex size-6 items-center justify-center rounded-full text-xs font-medium group-data-today:bg-primary group-data-today:text-primary-foreground">
              {format(day, "d")}
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center gap-1 p-1">
            <div className="flex flex-wrap justify-center gap-1 max-w-full">
              {sortEvents(allEvents)
                .slice(0, 4)
                .map((event) => (
                  <div
                    key={event.id}
                    className={`size-1.5 rounded-full ${getEventColorClasses(event.color).split(" ")[0]} opacity-80`} // Use simplified color handling if possible, or just parse generic bg
                  />
                ))}
              {allEvents.length > 4 && (
                <span className="text-[9px] text-muted-foreground leading-none font-medium self-center">
                  +
                </span>
              )}
            </div>
          </div>
        </DroppableCell>
      </div>
    );
  }

  // Desktop Rendering
  return (
    <div
      className="group relative overflow-hidden border-border/70 border-r border-b [&:nth-child(7n)]:border-r-0 bg-background data-weekend-cell:bg-muted/20 data-outside-cell:opacity-55 data-outside-cell:text-muted-foreground/70"
      data-outside-cell={!isCurrentMonth || undefined}
      data-weekend-cell={isWeekend || undefined}
      data-today={isSameDay(day, nowInUserTimezone) || undefined}
    >
      <DroppableCell
        date={day}
        id={cellId}
        onClick={() => {
          const startTime = new Date(day);
          startTime.setHours(DefaultStartHour, 0, 0);
          onEventCreate(startTime);
        }}
      >
        <div className="mt-1 flex justify-end">
          <div className="inline-flex size-6 items-center justify-center rounded-full text-sm group-data-today:bg-primary group-data-today:text-primary-foreground">
            {format(day, "d")}
          </div>
        </div>
        <div
          className="min-h-[calc((var(--event-height)+var(--event-gap))*2)] sm:min-h-[calc((var(--event-height)+var(--event-gap))*3)] lg:min-h-[calc((var(--event-height)+var(--event-gap))*4)]"
          ref={measureRef}
        >
          {sortEvents(allDayEvents).map((event, index) => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            const isFirstDay = isSameDay(day, eventStart);
            const isLastDay = isSameDay(day, eventEnd);

            const isHidden = isMounted && visibleCount && index >= visibleCount;

            if (!visibleCount) return null;

            if (!isFirstDay) {
              return (
                <div
                  aria-hidden={isHidden ? "true" : undefined}
                  className="aria-hidden:hidden"
                  key={`spanning-${event.id}-${day.toISOString().slice(0, 10)}`}
                >
                  <EventItem
                    event={event}
                    isFirstDay={isFirstDay}
                    isLastDay={isLastDay}
                    onClick={(e, triggerEl) => handleEventClick(event, e, triggerEl)}
                    timezone={timezone}
                    view="month"
                  >
                    <div aria-hidden={true} className="invisible">
                      {!event.allDay && <span>{format(new Date(event.start), "HH:mm")} </span>}
                      {event.title}
                    </div>
                  </EventItem>
                </div>
              );
            }

            return (
              <div
                aria-hidden={isHidden ? "true" : undefined}
                className="aria-hidden:hidden"
                key={event.id}
              >
                <DraggableEvent
                  event={event}
                  isFirstDay={isFirstDay}
                  isLastDay={isLastDay}
                  onClick={(e, triggerEl) => handleEventClick(event, e, triggerEl)}
                  timezone={timezone}
                  view="month"
                />
              </div>
            );
          })}

          {hasMore && (
            <Popover modal>
              <PopoverTrigger asChild>
                <button
                  className="mt-[var(--event-gap)] flex h-[var(--event-height)] w-full select-none items-center overflow-hidden px-1 text-left text-[10px] text-muted-foreground outline-none backdrop-blur-md transition hover:bg-muted/50 hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:px-2 sm:text-xs"
                  onClick={(e) => e.stopPropagation()}
                  type="button"
                >
                  <span>
                    + {remainingCount} <span className="max-sm:sr-only">more</span>
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="center"
                className="max-w-52 p-3"
                style={
                  {
                    "--event-height": `${EventHeight}px`,
                  } as Record<string, string>
                }
              >
                <div className="space-y-2">
                  <div className="font-medium text-sm">
                    {format(day, "EEE d", { locale: ptBR })}
                  </div>
                  <div className="space-y-1">
                    {sortEvents(allEvents).map((event) => {
                      const eventStart = new Date(event.start);
                      const eventEnd = new Date(event.end);
                      const isFirstDay = isSameDay(day, eventStart);
                      const isLastDay = isSameDay(day, eventEnd);

                      return (
                        <EventItem
                          event={event}
                          isFirstDay={isFirstDay}
                          isLastDay={isLastDay}
                          key={event.id}
                          onClick={(e, triggerEl) => handleEventClick(event, e, triggerEl)}
                          timezone={timezone}
                          view="month"
                        />
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </DroppableCell>
    </div>
  );
}
