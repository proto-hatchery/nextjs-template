"use client";

import {
  addHours,
  areIntervalsOverlapping,
  differenceInMinutes,
  eachDayOfInterval,
  eachHourOfInterval,
  endOfWeek,
  format,
  getHours,
  getMinutes,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { CalendarEvent } from "./types";
import { DraggableEvent } from "./draggable-event";
import { DroppableCell } from "./droppable-cell";
import { EventItem } from "./event-item";
import { isMultiDayEvent } from "./utils";
import { useCalendarDnd } from "./calendar-dnd-context";
import { useCurrentTimeIndicator } from "./hooks/use-current-time-indicator";
import { WeekCellsHeight } from "./constants";
import { EndHour, StartHour } from "./constants";
import { normalizeTimezone } from "@workspace/ui/lib/timezone-datetime";
import { cn } from "@workspace/ui/lib/utils";
import { getEventColorClasses } from "./utils";

interface WeekViewProps {
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

function formatTimezoneOffsetLabel(referenceDate: Date, timezone?: string): string {
  const targetTimezone = normalizeTimezone(timezone);

  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: targetTimezone,
      timeZoneName: "shortOffset",
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(referenceDate);

    const timeZoneName = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT";
    return timeZoneName.replace("UTC", "GMT");
  } catch {
    return "GMT";
  }
}

export function WeekView({
  currentDate,
  events,
  onEventSelect,
  onEventCreate,
  timezone,
}: WeekViewProps) {
  const { activeEvent } = useCalendarDnd();
  const dayColumnRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  const [dragCreate, setDragCreate] = useState<{
    mode: "idle" | "pending" | "dragging";
    dayIndex: number;
    pointerId: number;
    startTime: Date;
    currentTime: Date;
    startClientY: number;
  }>({
    currentTime: new Date(),
    dayIndex: -1,
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

  const getSnappedTimeFromClientY = (
    day: Date,
    clientY: number,
    dayIndex: number,
    allowEnd: boolean,
  ) => {
    const column = dayColumnRefs.current.get(dayIndex);
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

  const days = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ end: weekEnd, start: weekStart });
  }, [currentDate]);

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 0 }), [currentDate]);

  const hours = useMemo(() => {
    const dayStart = startOfDay(currentDate);
    return eachHourOfInterval({
      end: addHours(dayStart, EndHour - 1),
      start: addHours(dayStart, StartHour),
    });
  }, [currentDate]);

  const allDayEvents = useMemo(() => {
    return events
      .filter((event) => {
        // Include explicitly marked all-day events or multi-day events
        return event.allDay || isMultiDayEvent(event);
      })
      .filter((event) => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        return days.some(
          (day) =>
            isSameDay(day, eventStart) ||
            isSameDay(day, eventEnd) ||
            (day > eventStart && day < eventEnd),
        );
      });
  }, [events, days]);

  const processedDayEvents = useMemo(() => {
    const result = days.map((day) => {
      const dayEvents = events.filter((event) => {
        if (event.allDay || isMultiDayEvent(event)) return false;

        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);

        return (
          isSameDay(day, eventStart) ||
          isSameDay(day, eventEnd) ||
          (eventStart < day && eventEnd > day)
        );
      });

      const sortedEvents = [...dayEvents].sort((a, b) => {
        const aStart = new Date(a.start);
        const bStart = new Date(b.start);
        const aEnd = new Date(a.end);
        const bEnd = new Date(b.end);

        if (aStart < bStart) return -1;
        if (aStart > bStart) return 1;

        const aDuration = differenceInMinutes(aEnd, aStart);
        const bDuration = differenceInMinutes(bEnd, bStart);
        return bDuration - aDuration;
      });

      const positionedEvents: PositionedEvent[] = [];
      const dayStart = startOfDay(day);

      const columns: { event: CalendarEvent; end: Date }[][] = [];

      for (const event of sortedEvents) {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);

        const adjustedStart = isSameDay(day, eventStart) ? eventStart : dayStart;
        const adjustedEnd = isSameDay(day, eventEnd) ? eventEnd : addHours(dayStart, 24);

        const startHour = getHours(adjustedStart) + getMinutes(adjustedStart) / 60;
        const endHour = getHours(adjustedEnd) + getMinutes(adjustedEnd) / 60;

        const top = (startHour - StartHour) * WeekCellsHeight;
        const height = (endHour - startHour) * WeekCellsHeight;

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
                {
                  end: new Date(c.event.end),
                  start: new Date(c.event.start),
                },
              ),
            );

            if (!overlaps) {
              placed = true;
            } else {
              columnIndex++;
            }
          }
        }

        const currentColumn = columns[columnIndex] || [];
        columns[columnIndex] = currentColumn;
        currentColumn.push({ end: adjustedEnd, event });

        const width = columnIndex === 0 ? 1 : 0.9;
        const left = columnIndex === 0 ? 0 : columnIndex * 0.1;

        positionedEvents.push({
          event,
          height,
          left,
          top,
          width,
          zIndex: 10 + columnIndex, // Higher columns get higher z-index
        });
      }

      return positionedEvents;
    });

    return result;
  }, [days, events]);

  const handleEventClick = (
    event: CalendarEvent,
    e: React.MouseEvent,
    triggerElement?: HTMLElement,
  ) => {
    e.stopPropagation();
    onEventSelect(event, triggerElement);
  };

  const showAllDaySection = allDayEvents.length > 0;
  const { currentTime, currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(
    currentDate,
    "week",
    timezone,
  );

  return (
    <div className="flex h-full flex-col overflow-x-auto" data-slot="week-view">
      <div className="flex h-full flex-col min-w-[800px] sm:min-w-0">
        <div className="sticky top-0 z-30 grid grid-cols-8 border-border/70 border-b bg-background/80 backdrop-blur-md">
          <div className="py-2 text-center text-muted-foreground/70 text-sm">
            <span className="max-[479px]:sr-only">
              {formatTimezoneOffsetLabel(currentTime, timezone)}
            </span>
          </div>
          {days.map((day) => {
            let dayAbbr = format(day, "EEE", { locale: ptBR });

            if (dayAbbr.length > 4) {
              dayAbbr = dayAbbr.substring(0, 3);
            }

            dayAbbr = dayAbbr.replace(/\.$/, "");

            dayAbbr = dayAbbr.charAt(0).toUpperCase() + dayAbbr.slice(1).toLowerCase();

            const dayNumber = format(day, "d");

            return (
              <div
                className="py-2 text-center text-muted-foreground/70 text-sm font-medium data-today:text-foreground"
                data-today={isSameDay(day, currentTime) || undefined}
                key={day.toString()}
              >
                <span aria-hidden="true" className="sm:hidden">
                  {dayAbbr[0]} {dayNumber}
                </span>
                <span className="max-sm:hidden">
                  {dayAbbr} {dayNumber}
                </span>
              </div>
            );
          })}
        </div>

        {showAllDaySection && (
          <div className="border-border/70 border-b bg-muted/50">
            <div className="grid grid-cols-8">
              <div className="relative border-border/70 border-r">
                <span className="absolute bottom-0 left-0 h-6 w-16 max-w-full pe-2 text-right text-[10px] text-muted-foreground/70 sm:pe-4 sm:text-xs">
                  All day
                </span>
              </div>
              {days.map((day, dayIndex) => {
                const dayAllDayEvents = allDayEvents.filter((event) => {
                  const eventStart = new Date(event.start);
                  const eventEnd = new Date(event.end);
                  return (
                    isSameDay(day, eventStart) ||
                    (day > eventStart && day < eventEnd) ||
                    isSameDay(day, eventEnd)
                  );
                });

                return (
                  <div
                    className="relative border-border/70 border-r p-1 last:border-r-0"
                    data-today={isSameDay(day, currentTime) || undefined}
                    key={day.toString()}
                  >
                    {dayAllDayEvents.map((event) => {
                      const eventStart = new Date(event.start);
                      const eventEnd = new Date(event.end);
                      const isFirstDay = isSameDay(day, eventStart);
                      const isLastDay = isSameDay(day, eventEnd);

                      const isFirstVisibleDay = dayIndex === 0 && isBefore(eventStart, weekStart);
                      const shouldShowTitle = isFirstDay || isFirstVisibleDay;

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
                          {/* Show title if it's the first day of the event or the first visible day in the week */}
                          <div
                            aria-hidden={!shouldShowTitle}
                            className={cn("truncate", !shouldShowTitle && "invisible")}
                          >
                            {event.title}
                          </div>
                        </EventItem>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto scrollbar-none">
          <div className="grid grid-cols-8">
            <div className="grid auto-cols-fr border-border/70 border-r">
              {hours.map((hour, index) => (
                <div
                  className="relative h-[var(--week-cells-height)] border-border/70 border-b last:border-b-0"
                  key={hour.toString()}
                >
                  {index > 0 && (
                    <span className="-top-3 absolute left-0 flex h-6 w-16 max-w-full items-center justify-end bg-background pe-2 text-[10px] text-muted-foreground/70 sm:pe-4 sm:text-xs">
                      {format(hour, "HH:mm")}
                    </span>
                  )}{" "}
                </div>
              ))}
            </div>

            {days.map((day, dayIndex) => (
              <div
                className="relative grid auto-cols-fr border-border/70 border-r last:border-r-0"
                data-today={isSameDay(day, currentTime) || undefined}
                key={day.toString()}
                ref={(node) => {
                  dayColumnRefs.current.set(dayIndex, node);
                }}
              >
                {(processedDayEvents[dayIndex] ?? []).map((positionedEvent) => (
                  <div
                    className="absolute z-10 px-0.5"
                    key={positionedEvent.event.id}
                    onClick={(e) => e.stopPropagation()}
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
                        view="week"
                      />
                    </div>
                  </div>
                ))}

                {selection && dragCreate.dayIndex === dayIndex && (
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
                        "flex size-full flex-col overflow-hidden rounded px-1 py-1 text-[10px] font-medium backdrop-blur-md sm:px-2 sm:text-xs",
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

                {currentTimeVisible && isSameDay(day, currentTime) && (
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
                {hours.map((hour) => {
                  const hourValue = getHours(hour);
                  return (
                    <div
                      className="relative h-[var(--week-cells-height)] border-border/70 border-b last:border-b-0"
                      key={hour.toString()}
                    >
                      {[0, 1, 2, 3].map((quarter) => {
                        const quarterHourTime = hourValue + quarter * 0.25;
                        const startTime = new Date(day);
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
                            date={day}
                            id={`week-cell-${day.toISOString()}-${quarterHourTime}`}
                            key={`${hour.toString()}-${quarter}`}
                            onPointerDown={(e) => {
                              if (e.button !== 0) return;
                              if (activeEvent) return;
                              e.preventDefault();
                              e.currentTarget.setPointerCapture(e.pointerId);

                              setDragCreate({
                                currentTime: startTime,
                                dayIndex,
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
                                  day,
                                  e.clientY,
                                  dayIndex,
                                  true,
                                );
                                return { ...s, currentTime: nextCurrent, mode: "dragging" };
                              });
                            }}
                            onPointerUp={(e) => {
                              if (dragCreate.mode === "idle") return;
                              if (dragCreate.pointerId !== e.pointerId) return;

                              if (dragCreate.mode === "pending") {
                                onEventCreate(dragCreate.startTime);
                                setDragCreate((s) =>
                                  s.pointerId === e.pointerId && s.mode !== "idle"
                                    ? { ...s, mode: "idle" }
                                    : s,
                                );
                                return;
                              }

                              const endCandidate = getSnappedTimeFromClientY(
                                day,
                                e.clientY,
                                dayIndex,
                                true,
                              );
                              const a = dragCreate.startTime;
                              const b = endCandidate;
                              const rangeStart = isAfter(a, b) ? b : a;
                              let rangeEnd = isAfter(a, b) ? a : b;

                              if (rangeEnd.getTime() === rangeStart.getTime()) {
                                rangeEnd = new Date(
                                  rangeStart.getTime() + intervalMinutes * 60 * 1000,
                                );
                              }

                              onEventCreate(rangeStart, rangeEnd);
                              setDragCreate((s) =>
                                s.pointerId === e.pointerId && s.mode !== "idle"
                                  ? { ...s, mode: "idle" }
                                  : s,
                              );
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
