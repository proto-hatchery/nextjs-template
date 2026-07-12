"use client";

import { addDays, format, isSameDay, isToday } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Slot } from "radix-ui";
import {
  type ButtonHTMLAttributes,
  type ComponentProps,
  createContext,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
  useContext,
  useState,
} from "react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

// Context for sharing state between components
type MiniCalendarContextType = {
  selectedDate: Date | null | undefined;
  onDateSelect: (date: Date) => void;
  startDate: Date;
  onNavigate: (direction: "prev" | "next") => void;
  days: number;
};

const MiniCalendarContext = createContext<MiniCalendarContextType | null>(null);

export const useMiniCalendar = () => {
  const context = useContext(MiniCalendarContext);

  if (!context) {
    throw new Error("MiniCalendar components must be used within MiniCalendar");
  }

  return context;
};

// Helper function to get array of consecutive dates
const getDays = (startDate: Date, count: number): Date[] => {
  const days: Date[] = [];
  for (let i = 0; i < count; i++) {
    days.push(addDays(startDate, i));
  }
  return days;
};

// Helper function to format date
const formatDate = (date: Date) => {
  const month = format(date, "MMM");
  const day = format(date, "d");

  return { month, day };
};

export type MiniCalendarProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "value" | "defaultValue" | "onChange"
> & {
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (date: Date | undefined) => void;
  startDate?: Date;
  defaultStartDate?: Date;
  onStartDateChange?: (date: Date | undefined) => void;
  days?: number;
};

export const MiniCalendar = ({
  value,
  defaultValue,
  onValueChange,
  startDate,
  defaultStartDate = new Date(),
  onStartDateChange,
  days = 5,
  className,
  children,
  ...props
}: MiniCalendarProps) => {
  const isValueControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<Date | undefined>(defaultValue);
  const selectedDate = isValueControlled ? value : uncontrolledValue;
  const setSelectedDate = (nextDate: Date | undefined) => {
    if (!isValueControlled) {
      setUncontrolledValue(nextDate);
    }
    onValueChange?.(nextDate);
  };

  const isStartDateControlled = startDate !== undefined;
  const [uncontrolledStartDate, setUncontrolledStartDate] = useState(defaultStartDate);
  const currentStartDate = isStartDateControlled ? startDate : uncontrolledStartDate;
  const setCurrentStartDate = (nextDate: Date) => {
    if (!isStartDateControlled) {
      setUncontrolledStartDate(nextDate);
    }
    onStartDateChange?.(nextDate);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleNavigate = (direction: "prev" | "next") => {
    const newStartDate = addDays(
      currentStartDate || new Date(),
      direction === "next" ? days : -days,
    );
    setCurrentStartDate(newStartDate);
  };

  const contextValue: MiniCalendarContextType = {
    selectedDate: selectedDate || null,
    onDateSelect: handleDateSelect,
    startDate: currentStartDate || new Date(),
    onNavigate: handleNavigate,
    days,
  };

  return (
    <MiniCalendarContext.Provider value={contextValue}>
      <div
        className={cn("flex items-center gap-2 rounded-lg border bg-background p-2", className)}
        {...props}
      >
        {children}
      </div>
    </MiniCalendarContext.Provider>
  );
};

export type MiniCalendarNavigationProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  direction: "prev" | "next";
  asChild?: boolean;
};

export const MiniCalendarNavigation = ({
  direction,
  asChild = false,
  children,
  onClick,
  ...props
}: MiniCalendarNavigationProps) => {
  const { onNavigate } = useMiniCalendar();
  const Icon = direction === "prev" ? ChevronLeftIcon : ChevronRightIcon;

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onNavigate(direction);
    onClick?.(event);
  };

  if (asChild) {
    return (
      <Slot.Root onClick={handleClick} {...props}>
        {children}
      </Slot.Root>
    );
  }

  return (
    <Button
      onClick={handleClick}
      size={asChild ? undefined : "icon"}
      type="button"
      variant={asChild ? undefined : "ghost"}
      {...props}
    >
      {children ?? <Icon className="size-4" />}
    </Button>
  );
};

export type MiniCalendarDaysProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: (date: Date) => ReactNode;
};

export const MiniCalendarDays = ({ className, children, ...props }: MiniCalendarDaysProps) => {
  const { startDate, days: dayCount } = useMiniCalendar();
  const days = getDays(startDate, dayCount);

  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      {days.map((date) => children(date))}
    </div>
  );
};

export type MiniCalendarDayProps = ComponentProps<typeof Button> & {
  date: Date;
};

export const MiniCalendarDay = ({ date, className, ...props }: MiniCalendarDayProps) => {
  const { selectedDate, onDateSelect } = useMiniCalendar();
  const { month, day } = formatDate(date);
  const isSelected = selectedDate && isSameDay(date, selectedDate);
  const isTodayDate = isToday(date);

  return (
    <Button
      className={cn(
        "h-auto min-w-[3rem] flex-col gap-0 p-2 text-xs",
        isTodayDate && !isSelected && "bg-accent",
        className,
      )}
      onClick={() => onDateSelect(date)}
      size="sm"
      type="button"
      variant={isSelected ? "default" : "ghost"}
      {...props}
    >
      <span
        className={cn(
          "font-medium text-[10px] text-muted-foreground",
          isSelected && "text-primary-foreground/70",
        )}
      >
        {month}
      </span>
      <span className="font-semibold text-sm">{day}</span>
    </Button>
  );
};
