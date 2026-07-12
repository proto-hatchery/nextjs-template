"use client";

import * as React from "react";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayButton, useDayPicker, type MonthCaptionProps } from "react-day-picker";

import { cn } from "@workspace/ui/lib/utils";
import { isTodayInTimezone, nowInTimezone } from "@workspace/ui/lib/timezone-datetime";
import { Button } from "@workspace/ui/components/button";
import { Calendar } from "@workspace/ui/components/calendar";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Separator } from "@workspace/ui/components/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@workspace/ui/components/sheet";
import { type CalendarSource, type EventColor } from "./types";

interface MobileCalendarFiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calendars: CalendarSource[];
  selectedCalendars: Set<string>;
  onToggleCalendar: (calendarId: string) => void;
  onToggleAllCalendars: () => void;
  date: Date;
  onDateChange: (date: Date) => void;
  timezone?: string;
}

const calendarColorClasses: Record<EventColor, string> = {
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  orange: "bg-orange-500",
  rose: "bg-rose-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  indigo: "bg-indigo-500",
};

export function MobileCalendarFiltersSheet({
  open,
  onOpenChange,
  calendars,
  selectedCalendars,
  onToggleCalendar,
  onToggleAllCalendars,
  date,
  onDateChange,
  timezone,
}: MobileCalendarFiltersSheetProps) {
  // Custom DayButton for mini calendar with rounded-full styling
  const MiniCalendarDayButton = React.useCallback(
    ({ className, day, modifiers, ...props }: React.ComponentProps<typeof DayButton>) => {
      const isTodayDate = isTodayInTimezone(day.date, timezone);
      const isSelected =
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle;
      const isSelectedAndNotToday = isSelected && !isTodayDate;

      return (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 p-0 font-normal rounded-full",
            isTodayDate && "bg-primary text-primary-foreground",
            isSelectedAndNotToday && "bg-secondary text-secondary-foreground",
            !isTodayDate && !isSelected && "hover:bg-muted",
            className,
          )}
          {...props}
        >
          {day.date.getDate()}
        </Button>
      );
    },
    [timezone],
  );

  // Custom MonthCaption component that includes Nav inside the header
  const MiniCalendarCaption = (props: MonthCaptionProps) => {
    const { calendarMonth } = props;
    const { previousMonth, nextMonth, goToMonth } = useDayPicker();

    const displayMonth = calendarMonth.date;

    // Validate that displayMonth is a valid Date
    if (!displayMonth || !isValid(displayMonth)) {
      // Fallback to current date if invalid
      const fallbackDate = date || nowInTimezone(timezone);
      const month = format(fallbackDate, "MMMM", { locale: ptBR });
      const year = format(fallbackDate, "yyyy", { locale: ptBR });
      return (
        <div className="flex items-center justify-between w-full h-8 relative">
          <div className="text-sm font-medium">
            {month.charAt(0).toUpperCase() + month.slice(1)} {year}
          </div>
          <nav className="flex items-center gap-1" aria-label="Navigation bar">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="border-0 hover:bg-transparent hover:text-foreground size-8 p-0"
              disabled={!previousMonth}
              onClick={() => previousMonth && goToMonth(previousMonth)}
              aria-label="Go to previous month"
            >
              <ChevronLeftIcon size={16} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="border-0 hover:bg-transparent hover:text-foreground size-8 p-0"
              disabled={!nextMonth}
              onClick={() => nextMonth && goToMonth(nextMonth)}
              aria-label="Go to next month"
            >
              <ChevronRightIcon size={16} />
            </Button>
          </nav>
        </div>
      );
    }
    const month = format(displayMonth, "MMMM", { locale: ptBR });
    const year = format(displayMonth, "yyyy", { locale: ptBR });
    return (
      <div className="flex items-center justify-between w-full h-8 relative">
        <div className="text-sm font-medium">
          {month.charAt(0).toUpperCase() + month.slice(1)} {year}
        </div>
        <nav className="flex items-center gap-1" aria-label="Navigation bar">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="border-0 hover:bg-transparent hover:text-foreground size-8 p-0"
            disabled={!previousMonth}
            onClick={() => previousMonth && goToMonth(previousMonth)}
            aria-label="Go to previous month"
          >
            <ChevronLeftIcon size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="border-0 hover:bg-transparent hover:text-foreground size-8 p-0"
            disabled={!nextMonth}
            onClick={() => nextMonth && goToMonth(nextMonth)}
            aria-label="Go to next month"
          >
            <ChevronRightIcon size={16} />
          </Button>
        </nav>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
        <SheetHeader className="p-4 bg-muted/10 border-b">
          <SheetTitle>Navegação</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full pb-20">
          <div className="p-0">
            <Calendar
              className="w-full p-0"
              locale={ptBR}
              classNames={{
                month: "space-y-4 w-full",
                table: "w-full border-collapse space-y-1",
                head_row: "flex w-full justify-between",
                row: "flex w-full mt-2 justify-between",
                cell: "h-8 w-8 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                day: "h-8 w-8 p-0 font-normal",
                day_today: "bg-transparent",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_hidden: "invisible",
                today: "bg-transparent",
                nav: "hidden",
                nav_button: "border-0 hover:bg-transparent hover:text-foreground size-8 p-0",
                button_previous: "relative",
                button_next: "relative",
                caption: "flex justify-between items-center pt-1 relative mb-2 px-0",
                caption_label: "text-sm font-medium",
                month_caption: "flex items-center justify-between w-full h-8 relative",
              }}
              components={{
                DayButton: MiniCalendarDayButton,
                MonthCaption: MiniCalendarCaption,
              }}
              defaultMonth={date}
              mode="single"
              onSelect={(d) => {
                if (d) {
                  onDateChange(d);
                  onOpenChange(false);
                }
              }}
              selected={date}
              showOutsideDays={false}
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium leading-none">Calendários visíveis</p>
                <Button
                  className="h-8 px-2 text-xs rounded-full"
                  onClick={onToggleAllCalendars}
                  variant="ghost"
                >
                  {selectedCalendars.size === calendars.length ? "Ocultar todos" : "Mostrar todos"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Ative ou desative grupos como feriados e aniversários.
              </p>
            </div>

            <div className="space-y-1">
              {calendars.map((calendar) => (
                <div
                  key={calendar.id}
                  className="flex w-full items-center justify-between gap-2 px-2 py-1.5 transition hover:bg-muted/30 rounded-md"
                >
                  <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                    <Checkbox
                      aria-label={`Exibir calendário ${calendar.label}`}
                      checked={selectedCalendars.has(calendar.id)}
                      id={`mobile-calendar-${calendar.id}`}
                      onCheckedChange={() => onToggleCalendar(calendar.id)}
                      className="size-4 shrink-0"
                    />
                    <label
                      htmlFor={`mobile-calendar-${calendar.id}`}
                      className="flex cursor-pointer items-center gap-2 truncate flex-1 min-w-0"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "size-2 rounded-full shrink-0",
                          calendarColorClasses[calendar.color ?? "sky"],
                        )}
                      />
                      <span className="text-sm font-medium truncate">{calendar.label}</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
