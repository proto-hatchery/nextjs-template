"use client";

import {
  addHours,
  areIntervalsOverlapping,
  differenceInMinutes,
  eachHourOfInterval,
  format,
  getHours,
  getMinutes,
  isAfter,
  isSameDay,
  startOfDay,
} from "date-fns";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { type CalendarEvent } from "./types";
import { DraggableEvent } from "./draggable-event";
import { DroppableCell } from "./droppable-cell";
import { EventItem } from "./event-item";
import { isMultiDayEvent } from "./utils";
import { useCalendarDnd } from "./calendar-dnd-context";
import { useCurrentTimeIndicator } from "./hooks/use-current-time-indicator";
import { WeekCellsHeight } from "./constants";
import { EndHour, StartHour } from "./constants";
import { cn } from "@workspace/ui/lib/utils";
import { getEventColorClasses } from "./utils";

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent, triggerElement?: HTMLElement) => void;
  onEventCreate: (startTime: Date, endTime?: Date) => void;
  timezone?: string;
}

interface PositionedEvent {
  event: CalendarEvent;
  top: number;
  height: number;
  left: number;
  width: number;
  zIndex: number;
}

export function DayView({
  currentDate,
  events,
  onEventSelect,
  onEventCreate,
  timezone,
}: DayViewProps) {
  const { activeEvent } = useCalendarDnd();
  const dayColumnRef = useRef<HTMLDivElement | null>(null);

  const [dragCreate, setDragCreate] = useState<{
    mode: "idle" | "pending" | "dragging";
    pointerId: number;
    startTime: Date;
    currentTime: Date;
    startClientY: number;
  }>({
    currentTime: new Date(),
    mode: "idle",
    pointerId: -1,
    startClientY: 0,
    startTime: new Date(),
  });

  const cancelDragCreate = () => {
    setDragCreate((s) => (s.mode === "idle" ? s : { ...s, mode: "idle" }));
  };

  useEffect(() => {
    if (dragCreate.mode === "idle") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelDragCreate();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dragCreate.mode]);

  const selection = useMemo(() => {
    if (dragCreate.mode !== "dragging") return null;
    const a = dragCreate.startTime;
    const b = dragCreate.currentTime;
    const selectionStart = isAfter(a, b) ? b : a;
    let selectionEnd = isAfter(a, b) ? a : b;

    if (selectionEnd.getTime() === selectionStart.getTime()) {
      selectionEnd = new Date(selectionStart.getTime() + 15 * 60 * 1000);
    }

    return { selectionEnd, selectionStart };
  }, [dragCreate.currentTime, dragCreate.mode, dragCreate.startTime]);

  const intervalMinutes = 15;
  const totalMinutes = (EndHour - StartHour) * 60;
  const pxToMinutes = 60 / WeekCellsHeight;

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  const getSnappedTimeFromClientY = (day: Date, clientY: number, allowEnd: boolean) => {
    const column = dayColumnRef.current;
    if (!column) return new Date(day);
    const rect = column.getBoundingClientRect();
    const y = clamp(clientY - rect.top, 0, rect.height);
    const rawMinutes = y * pxToMinutes;

    const maxMinutes = allowEnd ? totalMinutes : totalMinutes - intervalMinutes;
    const clampedMinutes = clamp(rawMinutes, 0, maxMinutes);
    const snappedMinutes = Math.round(clampedMinutes / intervalMinutes) * intervalMinutes;

    const d = new Date(day);
    d.setHours(StartHour, 0, 0, 0);
    d.setMinutes(d.getMinutes() + snappedMinutes);
    return d;
  };

  const formatDragTime = (date: Date) => format(date, "HH:mm");

  const hours = useMemo(() => {
    const dayStart = startOfDay(currentDate);
    return eachHourOfInterval({
      end: addHours(dayStart, EndHour - 1),
      start: addHours(dayStart, StartHour),
    });
  }, [currentDate]);

  const dayEvents = useMemo(() => {
    return events
      .filter((event) => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        return (
          isSameDay(currentDate, eventStart) ||
          isSameDay(currentDate, eventEnd) ||
          (currentDate > eventStart && currentDate < eventEnd)
        );
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [currentDate, events]);

  // Filter all-day events
  const allDayEvents = useMemo(() => {
    return dayEvents.filter((event) => {
      // Include explicitly marked all-day events or multi-day events
      return event.allDay || isMultiDayEvent(event);
    });
  }, [dayEvents]);

  // Get only single-day time-based events
  const timeEvents = useMemo(() => {
    return dayEvents.filter((event) => {
      // Exclude all-day events and multi-day events
      return !event.allDay && !isMultiDayEvent(event);
    });
  }, [dayEvents]);

  // Process events to calculate positions
  const positionedEvents = useMemo(() => {
    const result: PositionedEvent[] = [];
    const dayStart = startOfDay(currentDate);

    // Sort events by start time and duration
    const sortedEvents = [...timeEvents].sort((a, b) => {
      const aStart = new Date(a.start);
      const bStart = new Date(b.start);
      const aEnd = new Date(a.end);
      const bEnd = new Date(b.end);

      // First sort by start time
      if (aStart < bStart) return -1;
      if (aStart > bStart) return 1;

      // If start times are equal, sort by duration (longer events first)
      const aDuration = differenceInMinutes(aEnd, aStart);
      const bDuration = differenceInMinutes(bEnd, bStart);
      return bDuration - aDuration;
    });

    // Track columns for overlapping events
    const columns: { event: CalendarEvent; end: Date }[][] = [];

    for (const event of sortedEvents) {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      // Adjust start and end times if they're outside this day
      const adjustedStart = isSameDay(currentDate, eventStart) ? eventStart : dayStart;
      const adjustedEnd = isSameDay(currentDate, eventEnd) ? eventEnd : addHours(dayStart, 24);

      // Calculate top position and height
      const startHour = getHours(adjustedStart) + getMinutes(adjustedStart) / 60;
      const endHour = getHours(adjustedEnd) + getMinutes(adjustedEnd) / 60;

      const top = (startHour - StartHour) * WeekCellsHeight;
      const height = (endHour - startHour) * WeekCellsHeight;

      // Find a column for this event
      let columnIndex = 0;
      let placed = false;

      while (!placed) {
        const col = columns[columnIndex] || [];
        if (col.length === 0) {
          columns[columnIndex] = col;
          placed = true;
        } else {
          const overlaps = col.some((c) =>
            areIntervalsOverlapping(
              { end: adjustedEnd, start: adjustedStart },
              { end: new Date(c.event.end), start: new Date(c.event.start) },
            ),
          );

          if (!overlaps) {
            placed = true;
          } else {
            columnIndex++;
          }
        }
      }

      // Ensure column is initialized before pushing
      const currentColumn = columns[columnIndex] || [];
      columns[columnIndex] = currentColumn;
      currentColumn.push({ end: adjustedEnd, event });

      // First column takes full width, others are indented by 10% and take 90% width
      const width = columnIndex === 0 ? 1 : 0.9;
      const left = columnIndex === 0 ? 0 : columnIndex * 0.1;

      result.push({
        event,
        height,
        left,
        top,
        width,
        zIndex: 10 + columnIndex,
      });
    }

    return result;
  }, [currentDate, timeEvents]);

  const handleEventClick = (
    event: CalendarEvent,
    e: React.MouseEvent,
    triggerElement?: HTMLElement,
  ) => {
    e.stopPropagation();
    onEventSelect(event, triggerElement);
  };

  const showAllDaySection = allDayEvents.length > 0;
  const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(
    currentDate,
    "day",
    timezone,
  );

  return (
    <div className="flex h-full flex-col" data-slot="day-view">
      {showAllDaySection && (
        <div className="border-border/70 border-t bg-muted/50">
          <div className="grid grid-cols-[3rem_1fr] sm:grid-cols-[4rem_1fr]">
            <div className="relative">
              <span className="absolute bottom-0 left-0 h-6 w-16 max-w-full pe-2 text-right text-[10px] text-muted-foreground/70 sm:pe-4 sm:text-xs">
                All day
              </span>
            </div>
            <div className="relative border-border/70 border-r p-1 last:border-r-0">
              {allDayEvents.map((event) => {
                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end);
                const isFirstDay = isSameDay(currentDate, eventStart);
                const isLastDay = isSameDay(currentDate, eventEnd);

                return (
                  <EventItem
                    event={event}
                    isFirstDay={isFirstDay}
                    isLastDay={isLastDay}
                    key={`spanning-${event.id}`}
                    onClick={(e, triggerEl) => handleEventClick(event, e, triggerEl)}
                    {...(timezone ? { timezone } : {})}
                    view="month"
                  >
                    {/* Always show the title in day view for better usability */}
                    <div>{event.title}</div>
                  </EventItem>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-none border-border/70 border-t">
        <div className="grid grid-cols-[3rem_1fr] sm:grid-cols-[4rem_1fr]">
          <div>
            {hours.map((hour, index) => (
              <div
                className="relative h-[var(--week-cells-height)] border-border/70 border-b last:border-b-0"
                key={hour.toString()}
              >
                {index > 0 && (
                  <span className="-top-3 absolute left-0 flex h-6 w-16 max-w-full items-center justify-end bg-background pe-2 text-[10px] text-muted-foreground/70 sm:pe-4 sm:text-xs">
                    {format(hour, "HH:mm")}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="relative" ref={dayColumnRef}>
            {/* Positioned events */}
            {positionedEvents.map((positionedEvent) => (
              <div
                className="absolute z-10 px-0.5"
                key={positionedEvent.event.id}
                style={{
                  height: `${positionedEvent.height}px`,
                  left: `${positionedEvent.left * 100}%`,
                  top: `${positionedEvent.top}px`,
                  width: `${positionedEvent.width * 100}%`,
                  zIndex: positionedEvent.zIndex,
                }}
              >
                <div className="size-full">
                  <DraggableEvent
                    event={positionedEvent.event}
                    height={positionedEvent.height}
                    onClick={(e, triggerEl) =>
                      handleEventClick(positionedEvent.event, e, triggerEl)
                    }
                    showTime
                    {...(timezone ? { timezone } : {})}
                    view="day"
                  />
                </div>
              </div>
            ))}

            {/* Drag-to-create preview */}
            {selection && (
              <div
                className="pointer-events-none absolute right-0 left-0 z-20 px-0.5 transition-[top,height] duration-100 ease-out"
                style={{
                  height: `${(differenceInMinutes(selection.selectionEnd, selection.selectionStart) / 60) * WeekCellsHeight}px`,
                  top: `${
                    (differenceInMinutes(
                      selection.selectionStart,
                      new Date(new Date(selection.selectionStart).setHours(StartHour, 0, 0, 0)),
                    ) /
                      60) *
                    WeekCellsHeight
                  }px`,
                }}
              >
                <div
                  className={cn(
                    "flex size-full flex-col overflow-hidden rounded px-1 py-1 text-xs font-medium backdrop-blur-md sm:px-2",
                    getEventColorClasses(undefined),
                    "opacity-70",
                  )}
                >
                  <div className="truncate font-normal opacity-80">
                    {formatDragTime(selection.selectionStart)} –{" "}
                    {formatDragTime(selection.selectionEnd)}
                  </div>
                </div>
              </div>
            )}

            {/* Current time indicator */}
            {currentTimeVisible && (
              <div
                className="pointer-events-none absolute right-0 left-0 z-20"
                style={{ top: `${currentTimePosition}%` }}
              >
                <div className="relative flex items-center">
                  <div className="-left-1 absolute h-2 w-2 rounded-full bg-primary" />
                  <div className="h-[2px] w-full bg-primary" />
                </div>
              </div>
            )}

            {/* Time grid */}
            {hours.map((hour) => {
              const hourValue = getHours(hour);
              return (
                <div
                  className="relative h-[var(--week-cells-height)] border-border/70 border-b last:border-b-0"
                  key={hour.toString()}
                >
                  {/* Quarter-hour intervals */}
                  {[0, 1, 2, 3].map((quarter) => {
                    const quarterHourTime = hourValue + quarter * 0.25;
                    const startTime = new Date(currentDate);
                    startTime.setHours(hourValue);
                    startTime.setMinutes(quarter * 15);
                    startTime.setSeconds(0);
                    startTime.setMilliseconds(0);

                    return (
                      <DroppableCell
                        className={cn(
                          "absolute h-[calc(var(--week-cells-height)/4)] w-full",
                          quarter === 0 && "top-0",
                          quarter === 1 && "top-[calc(var(--week-cells-height)/4)]",
                          quarter === 2 && "top-[calc(var(--week-cells-height)/4*2)]",
                          quarter === 3 && "top-[calc(var(--week-cells-height)/4*3)]",
                        )}
                        date={currentDate}
                        id={`day-cell-${currentDate.toISOString()}-${quarterHourTime}`}
                        key={`${hour.toString()}-${quarter}`}
                        onPointerDown={(e) => {
                          if (e.button !== 0) return;
                          if (activeEvent) return; // don't conflict with drag-n-drop
                          e.preventDefault();
                          e.currentTarget.setPointerCapture(e.pointerId);

                          setDragCreate({
                            currentTime: startTime,
                            mode: "pending",
                            pointerId: e.pointerId,
                            startClientY: e.clientY,
                            startTime,
                          });
                        }}
                        onPointerMove={(e) => {
                          setDragCreate((s) => {
                            if (s.mode === "idle") return s;
                            if (s.pointerId !== e.pointerId) return s;

                            const deltaY = Math.abs(e.clientY - s.startClientY);
                            const nextMode =
                              s.mode === "pending" && deltaY > 3 ? "dragging" : s.mode;
                            if (nextMode === "pending") return s;

                            const nextCurrent = getSnappedTimeFromClientY(
                              currentDate,
                              e.clientY,
                              true,
                            );
                            return { ...s, currentTime: nextCurrent, mode: "dragging" };
                          });
                        }}
                        onPointerUp={(e) => {
                          setDragCreate((s) => {
                            if (s.mode === "idle") return s;
                            if (s.pointerId !== e.pointerId) return s;

                            if (s.mode === "pending") {
                              onEventCreate(s.startTime);
                              return { ...s, mode: "idle" };
                            }

                            const endCandidate = getSnappedTimeFromClientY(
                              currentDate,
                              e.clientY,
                              true,
                            );
                            const a = s.startTime;
                            const b = endCandidate;
                            const rangeStart = isAfter(a, b) ? b : a;
                            let rangeEnd = isAfter(a, b) ? a : b;

                            if (rangeEnd.getTime() === rangeStart.getTime()) {
                              rangeEnd = new Date(
                                rangeStart.getTime() + intervalMinutes * 60 * 1000,
                              );
                            }

                            onEventCreate(rangeStart, rangeEnd);
                            return { ...s, mode: "idle" };
                          });
                        }}
                        onPointerCancel={() => cancelDragCreate()}
                        time={quarterHourTime}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
