"use client";

import { RiCalendarCheckLine } from "@remixicon/react";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  isSameMonth,
  startOfWeek,
  eachDayOfInterval,
  subMonths,
  subWeeks,
  isValid,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AgendaDaysToShow } from "./constants";
import { AgendaView } from "./agenda-view";
import { addHoursToDate } from "./utils";
import { CalendarDndProvider } from "./calendar-dnd-context";
import type { CalendarEvent } from "./types";
import type { CalendarView } from "./types";
import { DayView } from "./day-view";
import { EventGap, EventHeight, WeekCellsHeight } from "./constants";
import { MonthView } from "./month-view";
import { WeekView } from "./week-view";
import { normalizeTimezone, nowInTimezone } from "@workspace/ui/lib/timezone-datetime";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";

export interface EventCalendarProps {
  events?: CalendarEvent[];
  onEventAdd?: (event: CalendarEvent) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  className?: string;
  initialView?: CalendarView;
  getMeetLink?: (eventId: string) => Promise<string | null> | string | null;
  date?: Date;
  onDateChange?: (date: Date) => void;
  view?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  selectedEvent?: CalendarEvent | null;
  onSelectedEventChange?: (event: CalendarEvent | null, triggerElement?: HTMLElement) => void;
  onEventCreate?: (startTime: Date, endTime?: Date) => void;
  timezone?: string;
}

export function EventCalendar({
  events = [],
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  className,
  initialView = "month",
  getMeetLink,
  date: controlledDate,
  onDateChange,
  view: controlledView,
  onViewChange,
  selectedEvent: controlledSelectedEvent,
  onSelectedEventChange,
  onEventCreate: externalOnEventCreate,
  timezone,
}: EventCalendarProps) {
  const resolvedTimezone = normalizeTimezone(timezone);
  const [internalDate, setInternalDate] = useState(() => nowInTimezone(resolvedTimezone));
  const [internalView, setInternalView] = useState<CalendarView>(initialView);
  const [internalSelectedEvent, setInternalSelectedEvent] = useState<CalendarEvent | null>(null);
  const [meetLink, setMeetLink] = useState<string | null>(null);

  const currentDate = controlledDate ?? internalDate;
  const view = controlledView ?? internalView;
  const selectedEvent = controlledSelectedEvent ?? internalSelectedEvent;

  const setCurrentDate = (date: Date) => {
    if (onDateChange) {
      onDateChange(date);
    } else {
      setInternalDate(date);
    }
  };

  const setView = (v: CalendarView) => {
    if (onViewChange) {
      onViewChange(v);
    } else {
      setInternalView(v);
    }
  };

  const setSelectedEvent = (event: CalendarEvent | null, triggerElement?: HTMLElement) => {
    if (onSelectedEventChange) {
      onSelectedEventChange(event, triggerElement);
    } else {
      setInternalSelectedEvent(event);
    }
  };

  // Add keyboard shortcuts for view switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input, textarea or contentEditable element
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "m":
          setView("month");
          break;
        case "w":
          setView("week");
          break;
        case "d":
          setView("day");
          break;
        case "a":
          setView("agenda");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onViewChange]);

  const handlePrevious = () => {
    let newDate = currentDate;
    if (view === "month") {
      newDate = subMonths(currentDate, 1);
    } else if (view === "week") {
      newDate = subWeeks(currentDate, 1);
    } else if (view === "day") {
      newDate = addDays(currentDate, -1);
    } else if (view === "agenda") {
      // For agenda view, go back 30 days (a full month)
      newDate = addDays(currentDate, -AgendaDaysToShow);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    let newDate = currentDate;
    if (view === "month") {
      newDate = addMonths(currentDate, 1);
    } else if (view === "week") {
      newDate = addWeeks(currentDate, 1);
    } else if (view === "day") {
      newDate = addDays(currentDate, 1);
    } else if (view === "agenda") {
      // For agenda view, go forward 30 days (a full month)
      newDate = addDays(currentDate, AgendaDaysToShow);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(nowInTimezone(resolvedTimezone));
  };

  const handleEventSelect = async (event: CalendarEvent, triggerElement?: HTMLElement) => {
    // Debug log
    setSelectedEvent(event, triggerElement);

    // Fetch meet link if needed (internal selection)
    if (getMeetLink && event.id) {
      try {
        const link = await getMeetLink(event.id);
        setMeetLink(link);
      } catch (error) {
        setMeetLink(null);
      }
    } else {
      setMeetLink(null);
    }
  };

  const handleEventCreate = (startTime: Date, endTime?: Date) => {
    // Debug log

    if (externalOnEventCreate) {
      externalOnEventCreate(startTime, endTime);
      return;
    }

    const snapTo15Minutes = (date: Date) => {
      const snapped = new Date(date);
      const minutes = snapped.getMinutes();
      const remainder = minutes % 15;
      if (remainder !== 0) {
        if (remainder < 7.5) {
          // Round down to nearest 15 min
          snapped.setMinutes(minutes - remainder);
        } else {
          // Round up to nearest 15 min
          snapped.setMinutes(minutes + (15 - remainder));
        }
      }
      snapped.setSeconds(0);
      snapped.setMilliseconds(0);
      return snapped;
    };

    const start = snapTo15Minutes(startTime);
    const end = snapTo15Minutes(endTime ?? addHoursToDate(start, 1));
  };

  const handleEventDelete = (eventId: string) => {
    onEventDelete?.(eventId);
    setSelectedEvent(null);
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    onEventUpdate?.(updatedEvent);

    // Show toast notification when an event is updated via drag and drop
    toast(`Event "${updatedEvent.title}" moved`, {
      description: format(new Date(updatedEvent.start), "MMM d, yyyy", { locale: ptBR }),
      position: "bottom-left",
    });
  };

  const viewTitle = useMemo(() => {
    const renderMonthYear = (date: Date) => {
      const month = format(date, "MMMM", { locale: ptBR });
      const year = format(date, "yyyy", { locale: ptBR });
      return (
        <>
          <span>{month}</span> <span className="font-normal">{year}</span>
        </>
      );
    };

    if (view === "month") {
      return renderMonthYear(currentDate);
    }
    if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      if (isSameMonth(start, end)) {
        return renderMonthYear(start);
      }
      return `${format(start, "MMM", { locale: ptBR })} - ${format(end, "MMM yyyy", { locale: ptBR })}`;
    }
    if (view === "day") {
      return (
        <>
          <span aria-hidden="true" className="min-[480px]:hidden">
            {format(currentDate, "MMM d, yyyy", { locale: ptBR })}
          </span>
          <span aria-hidden="true" className="max-[479px]:hidden min-md:hidden">
            {format(currentDate, "MMMM d, yyyy", { locale: ptBR })}
          </span>
          <span className="max-md:hidden">
            {format(currentDate, "EEE MMMM d, yyyy", { locale: ptBR })}
          </span>
        </>
      );
    }
    if (view === "agenda") {
      // Show the month range for agenda view
      const start = currentDate;
      const end = addDays(currentDate, AgendaDaysToShow - 1);

      if (isSameMonth(start, end)) {
        return renderMonthYear(start);
      }
      return `${format(start, "MMM", { locale: ptBR })} - ${format(end, "MMM yyyy", { locale: ptBR })}`;
    }
    return renderMonthYear(currentDate);
  }, [currentDate, view]);

  return (
    <div
      className="flex h-full flex-col has-data-[slot=month-view]:flex-1"
      style={
        {
          "--event-gap": `${EventGap}px`,
          "--event-height": `${EventHeight}px`,
          "--week-cells-height": `${WeekCellsHeight}px`,
        } as React.CSSProperties
      }
    >
      <CalendarDndProvider onEventUpdate={handleEventUpdate} timezone={resolvedTimezone}>
        <div className={cn("flex items-center justify-between p-2 sm:p-4", className)}>
          <div className="flex items-center gap-1 sm:gap-4">
            <Button
              aria-label="Hoje"
              className="h-8 rounded-full px-3 text-xs font-bold bg-muted/40 hover:bg-muted/60 transition-colors max-[479px]:aspect-square max-[479px]:p-0 max-[479px]:h-8"
              onClick={handleToday}
              variant="ghost"
            >
              <RiCalendarCheckLine aria-hidden="true" className="min-[480px]:hidden" size={16} />
              <span className="max-[479px]:sr-only min-[480px]:inline font-bold">Hoje</span>
            </Button>
            <div className="flex items-center gap-1">
              <Button
                aria-label="Previous"
                onClick={handlePrevious}
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full bg-muted/40 hover:bg-muted/60 transition-colors"
              >
                <ChevronLeftIcon aria-hidden="true" size={16} />
              </Button>
              <Button
                aria-label="Next"
                onClick={handleNext}
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full bg-muted/40 hover:bg-muted/60 transition-colors"
              >
                <ChevronRightIcon aria-hidden="true" size={16} />
              </Button>
            </div>
            <h2 className="font-semibold text-sm sm:text-lg md:text-xl capitalize min-w-[110px] sm:min-w-[140px] md:min-w-[160px]">
              {viewTitle}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Tabs
              defaultValue={view}
              value={view}
              onValueChange={(v) => setView(v as CalendarView)}
            >
              <TabsList className="h-8 w-full justify-start overflow-x-auto gap-1 bg-transparent p-0 no-scrollbar sm:w-auto sm:overflow-visible">
                <TabsTrigger
                  value="month"
                  className="h-8 rounded-full px-3 sm:px-4 text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-muted/60 data-[state=active]:bg-muted/40 data-[state=active]:text-foreground data-[state=active]:opacity-100 transition-colors flex-shrink-0"
                >
                  Mês
                </TabsTrigger>
                <TabsTrigger
                  value="week"
                  className="h-8 rounded-full px-3 sm:px-4 text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-muted/60 data-[state=active]:bg-muted/40 data-[state=active]:text-foreground data-[state=active]:opacity-100 transition-colors flex-shrink-0"
                >
                  Semana
                </TabsTrigger>
                <TabsTrigger
                  value="day"
                  className="h-8 rounded-full px-3 sm:px-4 text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-muted/60 data-[state=active]:bg-muted/40 data-[state=active]:text-foreground data-[state=active]:opacity-100 transition-colors flex-shrink-0"
                >
                  Dia
                </TabsTrigger>
                <TabsTrigger
                  value="agenda"
                  className="h-8 rounded-full px-3 sm:px-4 text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-muted/60 data-[state=active]:bg-muted/40 data-[state=active]:text-foreground data-[state=active]:opacity-100 transition-colors flex-shrink-0"
                >
                  Agenda
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {view === "month" && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onEventCreate={handleEventCreate}
              onEventSelect={handleEventSelect}
              timezone={resolvedTimezone}
            />
          )}
          {view === "week" && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onEventCreate={handleEventCreate}
              onEventSelect={handleEventSelect}
              timezone={resolvedTimezone}
            />
          )}
          {view === "day" && (
            <DayView
              currentDate={currentDate}
              events={events}
              onEventCreate={handleEventCreate}
              onEventSelect={handleEventSelect}
              timezone={resolvedTimezone}
            />
          )}
          {view === "agenda" && (
            <AgendaView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              timezone={resolvedTimezone}
            />
          )}
        </div>
      </CalendarDndProvider>
    </div>
  );
}
