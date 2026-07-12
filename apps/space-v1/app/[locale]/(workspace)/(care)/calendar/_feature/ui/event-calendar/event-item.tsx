"use client";

import type { DraggableAttributes } from "@workspace/forms/dnd";
import { differenceInMinutes } from "date-fns";
import { RiCake2Fill } from "@remixicon/react";
import { useMemo } from "react";

import { type CalendarEvent } from "./types";
import { getBorderRadiusClasses, getEventColorClasses } from "./utils";
import { nowInTimezone } from "@workspace/ui/lib/timezone-datetime";
import { cn } from "@workspace/ui/lib/utils";

/** Shape of listeners returned by useDraggable (not exported by @dnd-kit/core) */
type DndListeners = Record<string, unknown>;

// Using date-fns format with custom formatting:
// 'HH:mm' - hours (00-23) and minutes (00-59)
const formatTimeWithOptionalMinutes = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h${String(minutes).padStart(2, "0")}`;
};

interface EventWrapperProps {
  event: CalendarEvent;
  isFirstDay?: boolean;
  isLastDay?: boolean;
  isDragging?: boolean;
  onClick?: (e: React.MouseEvent, triggerElement?: HTMLElement) => void;
  className?: string;
  children: React.ReactNode;
  currentTime?: Date;
  timezone?: string;
  dndListeners?: DndListeners;
  dndAttributes?: DraggableAttributes;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
}

// Shared wrapper component for event styling
function EventWrapper({
  event,
  isFirstDay = true,
  isLastDay = true,
  isDragging,
  onClick,
  className,
  children,
  currentTime,
  timezone,
  dndListeners,
  dndAttributes,
  onMouseDown,
  onTouchStart,
}: EventWrapperProps) {
  // Always use the currentTime (if provided) to determine if the event is in the past
  const displayEnd = currentTime
    ? new Date(
        new Date(currentTime).getTime() +
          (new Date(event.end).getTime() - new Date(event.start).getTime()),
      )
    : new Date(event.end);
  const referenceNow = currentTime ?? nowInTimezone(timezone);
  const isEventInPast = displayEnd.getTime() < referenceNow.getTime();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e, e.currentTarget);
  };

  return (
    <button
      className={cn(
        "flex size-full select-none overflow-hidden px-1 text-left font-medium outline-none backdrop-blur-md transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-dragging:cursor-grabbing data-past-event:line-through data-dragging:shadow-lg sm:px-2",
        getEventColorClasses(event.color),
        getBorderRadiusClasses(isFirstDay, isLastDay),
        className,
      )}
      data-dragging={isDragging || undefined}
      data-past-event={isEventInPast || undefined}
      onClick={handleClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      type="button"
      {...dndListeners}
      {...dndAttributes}
    >
      {children}
    </button>
  );
}

interface EventItemProps {
  event: CalendarEvent;
  view: "month" | "week" | "day" | "agenda";
  isDragging?: boolean;
  onClick?: (e: React.MouseEvent, triggerElement?: HTMLElement) => void;
  showTime?: boolean;
  currentTime?: Date; // For updating time during drag
  timezone?: string;
  isFirstDay?: boolean;
  isLastDay?: boolean;
  children?: React.ReactNode;
  className?: string;
  dndListeners?: DndListeners;
  dndAttributes?: DraggableAttributes;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
}

export function EventItem({
  event,
  view,
  isDragging,
  onClick,
  showTime,
  currentTime,
  timezone,
  isFirstDay = true,
  isLastDay = true,
  children,
  className,
  dndListeners,
  dndAttributes,
  onMouseDown,
  onTouchStart,
}: EventItemProps) {
  const eventColor = event.color;

  // Use the provided currentTime (for dragging) or the event's actual time
  const displayStart = useMemo(() => {
    return currentTime || new Date(event.start);
  }, [currentTime, event.start]);

  const displayEnd = useMemo(() => {
    return currentTime
      ? new Date(
          new Date(currentTime).getTime() +
            (new Date(event.end).getTime() - new Date(event.start).getTime()),
        )
      : new Date(event.end);
  }, [currentTime, event.start, event.end]);

  // Calculate event duration in minutes
  const durationMinutes = useMemo(() => {
    return differenceInMinutes(displayEnd, displayStart);
  }, [displayStart, displayEnd]);

  const getEventTime = () => {
    if (event.allDay) return "All day";

    // For short events (less than 45 minutes), only show start time
    if (durationMinutes < 45) {
      return formatTimeWithOptionalMinutes(displayStart);
    }

    // For longer events, show both start and end time
    return `${formatTimeWithOptionalMinutes(displayStart)} - ${formatTimeWithOptionalMinutes(displayEnd)}`;
  };

  if (view === "month") {
    const isBirthday = event.calendarId === "birthdays";

    return (
      <EventWrapper
        className={cn(
          "mt-[var(--event-gap)] h-[var(--event-height)] items-center text-[10px] sm:text-xs",
          className,
        )}
        {...(currentTime !== undefined ? { currentTime } : {})}
        {...(timezone !== undefined ? { timezone } : {})}
        {...(dndAttributes !== undefined ? { dndAttributes } : {})}
        {...(dndListeners !== undefined ? { dndListeners } : {})}
        event={event}
        {...(isDragging !== undefined ? { isDragging } : {})}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        {...(onClick !== undefined ? { onClick } : {})}
        {...(onMouseDown !== undefined ? { onMouseDown } : {})}
        {...(onTouchStart !== undefined ? { onTouchStart } : {})}
      >
        {children || (
          <span className="flex items-center gap-1 truncate">
            {isBirthday && (
              <RiCake2Fill className="size-3 shrink-0 sm:size-3.5" aria-hidden="true" />
            )}
            {!event.allDay && !isBirthday && (
              <span className="shrink-0 whitespace-nowrap font-normal opacity-70 sm:text-[11px]">
                {formatTimeWithOptionalMinutes(displayStart)}{" "}
              </span>
            )}
            <span className="min-w-0 truncate">{event.title}</span>
          </span>
        )}
      </EventWrapper>
    );
  }

  if (view === "week" || view === "day") {
    const isBirthday = event.calendarId === "birthdays";

    return (
      <EventWrapper
        className={cn(
          "py-1",
          durationMinutes < 45 ? "items-center" : "flex-col",
          view === "week" ? "text-[10px] sm:text-xs" : "text-xs",
          className,
        )}
        {...(currentTime !== undefined ? { currentTime } : {})}
        {...(timezone !== undefined ? { timezone } : {})}
        {...(dndAttributes !== undefined ? { dndAttributes } : {})}
        {...(dndListeners !== undefined ? { dndListeners } : {})}
        event={event}
        {...(isDragging !== undefined ? { isDragging } : {})}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        {...(onClick !== undefined ? { onClick } : {})}
        {...(onMouseDown !== undefined ? { onMouseDown } : {})}
        {...(onTouchStart !== undefined ? { onTouchStart } : {})}
      >
        {durationMinutes < 45 ? (
          <div className="flex min-w-0 items-center gap-1">
            {isBirthday && (
              <RiCake2Fill className="size-3 shrink-0 sm:size-3.5" aria-hidden="true" />
            )}
            {showTime && !isBirthday && (
              <span className="shrink-0 whitespace-nowrap opacity-70">
                {formatTimeWithOptionalMinutes(displayStart)}
              </span>
            )}
            <span className="min-w-0 truncate">{event.title}</span>
          </div>
        ) : (
          <>
            <div className="flex min-w-0 items-center gap-1 font-medium">
              {isBirthday && (
                <RiCake2Fill className="size-3 shrink-0 sm:size-3.5" aria-hidden="true" />
              )}
              <span className="min-w-0 truncate">{event.title}</span>
            </div>
            {showTime && !isBirthday && (
              <div className="whitespace-nowrap font-normal opacity-70 sm:text-[11px]">
                {getEventTime()}
              </div>
            )}
          </>
        )}
      </EventWrapper>
    );
  }

  // Agenda view - kept separate since it's significantly different
  const handleAgendaClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e, e.currentTarget);
  };

  const isBirthday = event.calendarId === "birthdays";
  const now = currentTime ?? nowInTimezone(timezone);
  const isEventInPast = displayEnd.getTime() < now.getTime();

  return (
    <button
      className={cn(
        "flex w-full flex-col gap-1 rounded p-2 text-left outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-past-event:line-through data-past-event:opacity-90",
        getEventColorClasses(eventColor),
        className,
      )}
      data-past-event={isEventInPast || undefined}
      onClick={handleAgendaClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      type="button"
      {...dndListeners}
      {...dndAttributes}
    >
      <div className="flex items-center gap-1.5 text-sm font-medium">
        {isBirthday && <RiCake2Fill className="size-4 shrink-0" aria-hidden="true" />}
        <span className="truncate">{event.title}</span>
      </div>
      <div className="text-xs opacity-70">
        {event.allDay ? (
          <span>All day</span>
        ) : (
          <span className="uppercase whitespace-nowrap">
            {formatTimeWithOptionalMinutes(displayStart)} -{" "}
            {formatTimeWithOptionalMinutes(displayEnd)}
          </span>
        )}
        {event.location && (
          <>
            <span className="px-1 opacity-35"> · </span>
            <span>{event.location}</span>
          </>
        )}
      </div>
      {event.description && <div className="my-1 text-xs opacity-90">{event.description}</div>}
    </button>
  );
}
