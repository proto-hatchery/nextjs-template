"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
  Calendar as CalendarIcon,
  List,
} from "lucide-react";
import {
  addDays,
  addMonths,
  addYears,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  subMonths,
  subYears,
  getYear,
  getMonth,
  isValid,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useMonthDetection } from "./hooks/use-month-detection";

import { normalizeTimezone, nowInTimezone } from "@workspace/ui/lib/timezone-datetime";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Checkbox } from "@workspace/ui/components/checkbox";
import type { CalendarEvent } from "./types";
import type { CalendarSource } from "./types";

type CalendarViewMode = "year" | "month" | "day";

interface MobileCalendarViewProps {
  events: CalendarEvent[];
  calendars: CalendarSource[];
  selectedCalendars: Set<string>;
  onToggleCalendar: (calendarId: string) => void;
  onToggleAllCalendars: () => void;
  date: Date;
  onDateChange: (date: Date) => void;
  onEventSelect: (event: CalendarEvent, triggerElement?: HTMLElement) => void;
  onEventAdd: () => void;
  timezone?: string;
}

const calendarColorClasses: Record<string, string> = {
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  orange: "bg-orange-500",
  rose: "bg-rose-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
};

export function MobileCalendarView({
  events,
  calendars,
  selectedCalendars,
  onToggleCalendar,
  onToggleAllCalendars,
  date,
  onDateChange,
  onEventSelect,
  onEventAdd,
  timezone,
}: MobileCalendarViewProps) {
  const resolvedTimezone = normalizeTimezone(timezone);
  const [view, setView] = React.useState<CalendarViewMode>("month");

  // Group events by day for quick lookup (dots)
  const eventsByDay = React.useMemo(() => {
    const map = new Map<string, string[]>();
    events.forEach((event) => {
      if (event.calendarId && !selectedCalendars.has(event.calendarId)) return;
      const dayKey = format(new Date(event.start), "yyyy-MM-dd");
      const existing = map.get(dayKey) || [];
      if (existing.length < 3) {
        existing.push(event.color || "sky");
        map.set(dayKey, existing);
      }
    });
    return map;
  }, [events, selectedCalendars]);

  const handleYearClick = (monthDate: Date) => {
    onDateChange(monthDate);
    setView("month");
  };

  const handleMonthClick = (dayDate: Date) => {
    onDateChange(dayDate);
    setView("day");
  };

  const handleBackToYear = () => {
    setView("year");
  };

  const handleBackToMonth = () => {
    setView("month");
  };

  const handleToday = () => {
    onDateChange(nowInTimezone(resolvedTimezone));
    // Optionally focus the month if in year view?
    if (view === "year") setView("month");
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden text-foreground selection:bg-primary/20">
      <AnimatePresence mode="wait" initial={false}>
        {view === "year" && (
          <YearView
            key="year"
            currentDate={date}
            onMonthSelect={handleYearClick}
            onEventAdd={onEventAdd}
            timezone={resolvedTimezone}
          />
        )}
        {view === "month" && (
          <MonthView
            key="month"
            currentDate={date}
            onDaySelect={handleMonthClick}
            onBack={handleBackToYear}
            onEventAdd={onEventAdd}
            eventsByDay={eventsByDay}
            calendars={calendars}
            selectedCalendars={selectedCalendars}
            onToggleCalendar={onToggleCalendar}
            onToggleAllCalendars={onToggleAllCalendars}
            timezone={resolvedTimezone}
          />
        )}
        {view === "day" && (
          <DayView
            key="day"
            currentDate={date}
            onDateChange={onDateChange}
            onBack={handleBackToMonth}
            onEventAdd={onEventAdd}
            events={events.filter((e) => !e.calendarId || selectedCalendars.has(e.calendarId))}
            onEventSelect={onEventSelect}
            timezone={resolvedTimezone}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- YEAR VIEW ---

function YearView({
  currentDate,
  onMonthSelect,
  onEventAdd,
  timezone,
}: {
  currentDate: Date;
  onMonthSelect: (d: Date) => void;
  onEventAdd: () => void;
  timezone: string;
}) {
  const nowInUserTimezone = React.useMemo(() => nowInTimezone(timezone), [timezone]);
  // Generate a range of years for vertical scroll
  const years = React.useMemo(() => {
    const startYear = getYear(currentDate);
    // Show previous year and next 3 years
    return Array.from({ length: 5 }, (_, i) => startYear - 1 + i);
  }, [currentDate]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", damping: 30, stiffness: 250 }}
      className="flex flex-col h-full bg-background"
    >
      {/* Primary Header - Fixed */}
      <header className="z-[101] flex items-center justify-end px-6 py-2 pt-[calc(env(safe-area-inset-top)+8px)] pb-4 bg-background/85 backdrop-blur-xl border-b border-border/10 transition-all">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-red-500 hover:bg-transparent">
            <Search className="size-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEventAdd}
            className="text-red-500 hover:bg-transparent"
          >
            <Plus className="size-8" />
          </Button>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 pb-32">
          {years.map((year) => {
            const isCurrentYear = year === getYear(nowInUserTimezone);
            return (
              <div key={year} className="mb-12">
                <div
                  className={cn(
                    "text-3xl font-bold mb-6 px-2 border-b border-border/40 pb-2",
                    isCurrentYear ? "text-red-500" : "text-foreground",
                  )}
                >
                  {year}
                </div>
                {/* Optimized grid for mobile widths */}
                <div className="grid grid-cols-3 gap-x-2 gap-y-8">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const monthDate = new Date(year, i, 1);
                    const isThisMonth = isSameMonth(monthDate, nowInUserTimezone);
                    return (
                      <div
                        key={i}
                        onClick={() => onMonthSelect(monthDate)}
                        className="flex flex-col active:opacity-50 transition-opacity cursor-pointer"
                      >
                        <span
                          className={cn(
                            "text-[13px] font-semibold mb-2 pl-0.5",
                            isThisMonth ? "text-red-500" : "text-foreground",
                          )}
                        >
                          {format(monthDate, "MMMM", { locale: ptBR }).replace(/^\w/, (c) =>
                            c.toUpperCase(),
                          )}
                        </span>
                        <MiniMonth month={monthDate} timezone={timezone} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function MiniMonth({ month, timezone }: { month: Date; timezone: string }) {
  const nowInUserTimezone = React.useMemo(() => nowInTimezone(timezone), [timezone]);
  const days = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  return (
    <div className="grid grid-cols-7 text-[7px] gap-y-[2px] pointer-events-none font-medium">
      {days.map((day, i) => {
        const isCurrentMonth = isSameMonth(day, month);
        const isTodayDay = isSameDay(day, nowInUserTimezone);
        return (
          <div
            key={i}
            className={cn(
              "flex items-center justify-center p-[2px] aspect-square rounded-full transition-colors",
              !isCurrentMonth && "opacity-0",
              isTodayDay && "bg-red-500 text-white font-bold",
            )}
          >
            {day.getDate()}
          </div>
        );
      })}
    </div>
  );
}

// --- MONTH VIEW ---

function MonthView({
  currentDate,
  onDaySelect,
  onBack,
  onEventAdd,
  eventsByDay,
  calendars,
  selectedCalendars,
  onToggleCalendar,
  onToggleAllCalendars,
  timezone,
}: {
  currentDate: Date;
  onDaySelect: (d: Date) => void;
  onBack: () => void;
  onEventAdd: () => void;
  eventsByDay: Map<string, string[]>;
  calendars: CalendarSource[];
  selectedCalendars: Set<string>;
  onToggleCalendar: (id: string) => void;
  onToggleAllCalendars: () => void;
  timezone: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const visibleMonth = useMonthDetection(containerRef, "section[data-month]");

  // Generate 12 months for vertical scroll (6 before, 6 after)
  const months = React.useMemo(() => {
    return Array.from({ length: 13 }, (_, i) => addMonths(subMonths(currentDate, 6), i));
  }, [currentDate]);

  // Determine header year: prioritization visibleMonth > currentDate
  const headerYear = visibleMonth ? visibleMonth.year : getYear(currentDate);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ type: "spring", damping: 30, stiffness: 250 }}
      className="flex flex-col h-full bg-background"
    >
      {/* Primary Header - Fixed */}
      <header className="z-[101] flex items-center justify-between px-4 py-2 pt-[calc(env(safe-area-inset-top)+8px)] pb-3 bg-background/85 backdrop-blur-xl border-b border-border/10 transition-all">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-red-500 gap-1 px-0 font-normal hover:bg-transparent active:opacity-60 transition-none"
        >
          <ChevronLeft className="size-7" />
          <span className="text-xl">{headerYear}</span>
        </Button>
        <div className="flex items-center gap-1">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-red-500 hover:bg-transparent">
                <CalendarIcon className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="rounded-t-[30px] max-h-[85vh] p-0 border-none shadow-2xl overflow-hidden"
            >
              <div className="p-6 bg-muted/30 h-full backdrop-blur-xl">
                <SheetHeader className="mb-6 flex flex-row items-center justify-between space-y-0">
                  <SheetTitle className="text-2xl font-bold">Calendários</SheetTitle>
                  <Button
                    variant="ghost"
                    onClick={onToggleAllCalendars}
                    className="text-red-500 p-0 h-auto font-normal text-lg"
                  >
                    {selectedCalendars.size === calendars.length ? "Ocultar Tudo" : "Mostrar Tudo"}
                  </Button>
                </SheetHeader>
                <div className="bg-card/50 backdrop-blur-md rounded-2xl overflow-hidden mb-8 border border-white[0.05]">
                  {calendars.map((cal, idx) => (
                    <div
                      key={cal.id}
                      className={cn(
                        "flex items-center gap-4 py-4 px-5",
                        idx !== calendars.length - 1 && "border-b border-border/50",
                      )}
                    >
                      <Checkbox
                        id={`m-cal-${cal.id}`}
                        checked={selectedCalendars.has(cal.id)}
                        onCheckedChange={() => onToggleCalendar(cal.id)}
                        className="rounded-full size-6 border-2 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                      />
                      <label
                        htmlFor={`m-cal-${cal.id}`}
                        className="flex items-center gap-3 flex-1 text-lg font-medium"
                      >
                        <div
                          className={cn(
                            "size-3 rounded-full",
                            calendarColorClasses[cal.color || "sky"],
                          )}
                        />
                        {cal.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Button variant="ghost" size="icon" className="text-red-500 hover:bg-transparent">
            <Search className="size-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEventAdd}
            className="text-red-500 hover:bg-transparent"
          >
            <Plus className="size-8" />
          </Button>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide" ref={containerRef}>
        <div className="pb-32">
          {months.map((m, idx) => {
            const mName = format(m, "MMMM", { locale: ptBR });
            const displayTitle =
              mName.charAt(0).toUpperCase() + mName.slice(1) + " " + format(m, "yyyy");
            const dataMonth = `${getMonth(m)}-${getYear(m)}`;

            return (
              <section
                key={idx}
                data-month={dataMonth}
                data-month-name={mName}
                className="mb-8 mt-0 first:mt-0"
              >
                {/* Secondary Header - Sticky inside scroll */}
                <div className="sticky top-0 z-[100] bg-background/95 backdrop-blur-md py-2 px-6 border-b border-border/5 mb-4 shadow-sm">
                  <h2 className="text-lg font-bold text-foreground">{displayTitle}</h2>
                </div>

                <div className="px-2">
                  <MonthGrid
                    month={m}
                    onDayClick={onDaySelect}
                    eventsByDay={eventsByDay}
                    selectedDate={currentDate}
                    timezone={timezone}
                  />
                </div>
              </section>
            );
          })}
          <div className="h-40" />
        </div>
      </div>
    </motion.div>
  );
}

function MonthGrid({
  month,
  onDayClick,
  eventsByDay,
  selectedDate,
  timezone,
}: {
  month: Date;
  onDayClick: (d: Date) => void;
  eventsByDay: Map<string, string[]>;
  selectedDate: Date;
  timezone: string;
}) {
  const nowInUserTimezone = React.useMemo(() => nowInTimezone(timezone), [timezone]);
  const days = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-7 mb-4">
        {weekDays.map((d, i) => (
          <div key={i} className="text-center text-[11px] font-bold text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, month);
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDay = isSameDay(day, nowInUserTimezone);
          const dateKey = format(day, "yyyy-MM-dd");
          const colors = eventsByDay.get(dateKey) || [];

          return (
            <div
              key={i}
              onClick={() => onDayClick(day)}
              className={cn(
                "relative flex flex-col items-center justify-start h-16 pt-1 active:opacity-50 transition-opacity",
                !isCurrentMonth && "opacity-0 pointer-events-none",
              )}
            >
              <div
                className={cn(
                  "size-10 flex items-center justify-center rounded-full text-2xl transition-all",
                  isTodayDay && !isSelected && "text-red-500 font-bold",
                  isSelected && "bg-foreground text-background font-bold",
                )}
              >
                {day.getDate()}
              </div>
              <div className="flex gap-1 mt-1.5 h-1">
                {colors.map((c, ki) => (
                  <div
                    key={ki}
                    className={cn(
                      "size-1.5 rounded-full",
                      calendarColorClasses[c] || "bg-gray-400",
                      isSelected && "bg-white",
                    )}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- DAY VIEW ---

function DayView({
  currentDate,
  onDateChange,
  onBack,
  onEventAdd,
  events,
  onEventSelect,
  timezone,
}: {
  currentDate: Date;
  onDateChange: (d: Date) => void;
  onBack: () => void;
  onEventAdd: () => void;
  events: CalendarEvent[];
  onEventSelect: (e: CalendarEvent) => void;
  timezone: string;
}) {
  const nowInUserTimezone = React.useMemo(() => nowInTimezone(timezone), [timezone]);
  const weekDays = React.useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, [currentDate]);

  const dayEvents = React.useMemo(() => {
    return events
      .filter((e) => {
        const start = e.start ? new Date(e.start) : null;
        const end = e.end ? new Date(e.end) : null;
        if (!start || !end || !isValid(start) || !isValid(end)) return false;

        const dayStart = new Date(currentDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(23, 59, 59, 999);
        return start <= dayEnd && end >= dayStart;
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [events, currentDate]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ type: "spring", damping: 30, stiffness: 250 }}
      className="flex flex-col h-full bg-background"
    >
      {/* Fixed Primary Header + Week Strip Container */}
      <div className="flex flex-col z-[101] bg-background/85 backdrop-blur-xl border-b border-border/10 transition-all">
        <header className="flex items-center justify-between px-4 py-1 pt-[calc(env(safe-area-inset-top)+8px)]">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-red-500 gap-1 px-0 font-normal hover:bg-transparent active:opacity-60 transition-none"
          >
            <ChevronLeft className="size-7" />
            <span className="text-xl">
              {format(currentDate, "MMMM", { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase())}
            </span>
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-red-500 hover:bg-transparent">
              <List className="size-6" />
            </Button>
            <Button variant="ghost" size="icon" className="text-red-500 hover:bg-transparent">
              <Search className="size-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEventAdd}
              className="text-red-500 hover:bg-transparent"
            >
              <Plus className="size-8" />
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-7 px-2 pb-2 pt-2">
          {weekDays.map((d, i) => {
            const isSel = isSameDay(d, currentDate);
            const isT = isSameDay(d, nowInUserTimezone);
            return (
              <div
                key={i}
                onClick={() => onDateChange(d)}
                className="flex flex-col items-center gap-2 cursor-pointer active:scale-90 transition-transform"
              >
                <span className="text-[11px] font-bold text-gray-400 uppercase">
                  {format(d, "ccccc", { locale: ptBR })}
                </span>
                <div
                  className={cn(
                    "size-8 flex items-center justify-center rounded-full text-[17px] font-medium transition-all",
                    isT && !isSel && "text-red-500 font-bold",
                    isSel && "bg-foreground text-background font-bold shadow-md",
                  )}
                >
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide relative bg-background">
        {/* Date Header inside Scroll? No, Apple keeps Day View week strip fixed. */}
        {/* Just the grid scrolls. */}

        <div className="bg-muted/30 py-1 px-4 text-center border-b border-border/10">
          <span className="text-sm font-semibold text-muted-foreground">
            {format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </span>
        </div>

        <div className="relative h-[1550px] px-0 pb-32 mt-4">
          {/* Hour Grid Lines */}
          <div className="absolute inset-0 flex flex-col">
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className="h-16 relative flex items-start">
                <span className="w-16 text-right pr-4 text-[13px] font-medium text-muted-foreground/60 -mt-2.5">
                  {h.toString().padStart(2, "0")}:00
                </span>
                <div className="flex-1 border-t border-border/30 mt-0" />
              </div>
            ))}
          </div>

          {/* Events Layer */}
          <div className="absolute inset-0 left-16 right-4">
            {dayEvents.map((event) => {
              const startRaw = new Date(event.start);
              const endRaw = new Date(event.end);
              const startH = startRaw.getHours();
              const startM = startRaw.getMinutes();
              const endH = endRaw.getHours();
              const endM = endRaw.getMinutes();

              const top = startH * 64 + (startM * 64) / 60;
              const height = Math.max(32, endH * 64 + (endM * 64) / 60 - top);

              return (
                <div
                  key={event.id}
                  onClick={() => onEventSelect(event)}
                  className={cn(
                    "absolute left-0 right-0 p-3 rounded-lg border-l-[4px] shadow-sm active:scale-[0.98] transition-transform overflow-hidden cursor-pointer",
                    calendarColorClasses[event.color || "sky"] || "bg-sky-500",
                    "bg-opacity-10 border-opacity-100",
                  )}
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    borderColor:
                      event.color === "sky"
                        ? "#0ea5e9"
                        : event.color === "amber"
                          ? "#f59e0b"
                          : event.color === "emerald"
                            ? "#10b981"
                            : event.color === "rose"
                              ? "#f43f5e"
                              : event.color === "orange"
                                ? "#f97316"
                                : "#8b5cf6",
                  }}
                >
                  <h4 className="font-bold text-sm leading-tight truncate text-foreground">
                    {event.title}
                  </h4>
                  {height > 50 && (
                    <div className="flex flex-col gap-0.5 mt-1">
                      {event.location && (
                        <p className="text-xs text-muted-foreground truncate opacity-80">
                          📍 {event.location}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground font-medium uppercase opacity-60">
                        {format(startRaw, "HH:mm")} - {format(endRaw, "HH:mm")}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Current Time Indicator */}
            {isSameDay(currentDate, nowInUserTimezone) && (
              <div
                className="absolute left-[-16px] right-[-16px] z-20 flex items-center pointer-events-none"
                style={{
                  top: `${nowInUserTimezone.getHours() * 64 + (nowInUserTimezone.getMinutes() * 64) / 60}px`,
                }}
              >
                <div className="size-2.5 rounded-full bg-red-500 shadow-sm ml-[-5px]" />
                <div className="h-[2px] flex-1 bg-red-500" />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
