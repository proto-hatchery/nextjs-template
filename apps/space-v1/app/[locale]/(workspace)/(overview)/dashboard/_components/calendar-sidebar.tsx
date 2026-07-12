"use client";

import { usePsychologistTimezone } from "@workspace/supabase-data/hooks/psychologists/use-psychologist-queries";
import { Calendar } from "@workspace/ui/components/calendar";
import { Card } from "@workspace/ui/components/card";
import { isTodayInTimezone, nowInTimezone } from "@workspace/ui/lib/timezone-datetime";
import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { useCallback, useState } from "react";
// Usando tipos inline para evitar conflito de versões do react-day-picker

export function CalendarSidebar() {
  const router = useRouter();
  const userTimezone = usePsychologistTimezone();
  const [date, setDate] = useState<Date>(() => nowInTimezone(userTimezone));
  const [currentMonth, setCurrentMonth] = useState<Date>(() => nowInTimezone(userTimezone));

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      const normalizedDate = new Date(selectedDate);
      normalizedDate.setHours(12, 0, 0, 0);
      router.push(`/calendar?view=day&date=${encodeURIComponent(normalizedDate.toISOString())}`);
    }
  };

  const handleMonthChange = useCallback((newMonth: Date) => {
    setCurrentMonth(newMonth);
  }, []);

  // Custom DayButton component with rounded-full styling
  const CustomDayButton = useCallback(
    ({
      className,
      day,
      modifiers,
      ...props
    }: {
      className?: string | undefined;
      day: { date: Date };
      modifiers: Record<string, boolean>;
    } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
      const isTodayDate = isTodayInTimezone(day.date, userTimezone);

      const isSelected =
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle;

      const isSelectedAndNotToday = isSelected && !isTodayDate;

      return (
        <BrandButton
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
          {/* empty */}
          {day.date.getDate()}
        </BrandButton>
      );
    },
    [userTimezone],
  );

  // Custom MonthCaption component with label on one side and navigation buttons on the other
  const CustomMonthCaption = useCallback(
    (props: { calendarMonth?: { date: Date }; displayIndex?: number }) => {
      const { calendarMonth } = props;
      const displayMonth = calendarMonth?.date ?? currentMonth;

      // Calculate previous and next months

      const prevMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1);

      const nextMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1);

      const handlePreviousMonth = () => {
        handleMonthChange(prevMonth);
      };

      const handleNextMonth = () => {
        handleMonthChange(nextMonth);
      };

      // Validate that displayMonth is a valid Date
      if (!isValid(displayMonth)) {
        const fallbackDate = currentMonth || nowInTimezone(userTimezone);
        const month = format(fallbackDate, "MMMM", { locale: ptBR });
        const year = format(fallbackDate, "yyyy", { locale: ptBR });
        return (
          <div className="flex items-center justify-between w-full h-8 relative">
            <div className="text-sm font-medium">
              {month.charAt(0).toUpperCase() + month.slice(1)} {year}
            </div>
            <nav className="flex items-center gap-1" aria-label="Navigation bar">
              <BrandButton
                type="button"
                variant="ghost"
                size="icon"
                className="border-0 hover:bg-transparent hover:text-foreground size-8 p-0"
                onClick={handlePreviousMonth}
                aria-label="Go to previous month"
              >
                <ChevronLeftIcon size={16} />
              </BrandButton>
              <BrandButton
                type="button"
                variant="ghost"
                size="icon"
                className="border-0 hover:bg-transparent hover:text-foreground size-8 p-0"
                onClick={handleNextMonth}
                aria-label="Go to next month"
              >
                <ChevronRightIcon size={16} />
              </BrandButton>
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
            <BrandButton
              type="button"
              variant="ghost"
              size="icon"
              className="border-0 hover:bg-transparent hover:text-foreground size-8 p-0"
              onClick={handlePreviousMonth}
              aria-label="Go to previous month"
            >
              <ChevronLeftIcon size={16} />
            </BrandButton>
            <BrandButton
              type="button"
              variant="ghost"
              size="icon"
              className="border-0 hover:bg-transparent hover:text-foreground size-8 p-0"
              onClick={handleNextMonth}
              aria-label="Go to next month"
            >
              <ChevronRightIcon size={16} />
            </BrandButton>
          </nav>
        </div>
      );
    },
    [currentMonth, handleMonthChange, userTimezone],
  );

  return (
    <Card className="border-none bg-muted/50 shadow-none p-2 pb-3">
      <div className="flex justify-center w-full">
        <Calendar
          aria-label="Calendário de navegação"
          selected={date}
          onSelect={handleSelect}
          month={currentMonth}
          onMonthChange={handleMonthChange}
          mode="single"
          showOutsideDays={false}
          className="bg-transparent p-0"
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
            DayButton: CustomDayButton,
            MonthCaption: CustomMonthCaption,
          }}
        />
      </div>
    </Card>
  );
}
