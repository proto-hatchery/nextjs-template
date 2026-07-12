import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { addMinutes, format } from "date-fns";
import { useEffect, useRef, useState } from "react";

export interface TimeSlotSelectorProps {
  selectedDate: Date | undefined;
  onTimeSelect: (timeStr: string) => void;
  timezone?: string;
  className?: string;
  duration?: number; // in minutes, default to 50 for preview
}

// Full list of potential slots - could be passed as prop in real app
const ALL_TIME_SLOTS = [
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
];

// Mock occupied slots for demonstration
const OCCUPIED_SLOTS = ["09:00", "14:30", "10:30"];

export function TimeSlotSelector({
  selectedDate,
  onTimeSelect,
  timezone: _timezone,
  className,
  duration = 50,
}: TimeSlotSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);

  const selectedTimeStr = selectedDate ? format(selectedDate, "HH:mm") : null;

  // Scroll selected item into view on mount/change
  useEffect(() => {
    if (selectedTimeStr && containerRef.current) {
      const selectedEl = containerRef.current.querySelector(`[data-selected="true"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [selectedTimeStr]);

  // Filter slots: 08:00 to 18:00 by default
  const visibleSlots = showAll
    ? ALL_TIME_SLOTS
    : ALL_TIME_SLOTS.filter((time) => {
        const hour = parseInt(time.split(":")[0] ?? "0");
        return hour >= 8 && hour <= 18;
      });

  return (
    <div className={cn("space-y-4", className)}>
      {/* Time List */}
      <div
        ref={containerRef}
        className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted/50 scrollbar-track-transparent"
      >
        {visibleSlots.map((time) => {
          const isSelected = selectedTimeStr === time;
          const isOccupied = OCCUPIED_SLOTS.includes(time);

          const [hours, minutes] = time.split(":").map(Number);
          const startTime = new Date();
          startTime.setHours(hours ?? 0, minutes ?? 0);
          const endTime = addMinutes(startTime, duration);
          const timeRange = `${time} - ${format(endTime, "HH:mm")}`;

          return (
            <BrandButton
              key={time}
              variant="ghost"
              disabled={isOccupied}
              onClick={() => !isOccupied && onTimeSelect(time)}
              data-selected={isSelected}
              className={cn(
                "group flex items-center justify-between w-full p-4 rounded-lg transition-all duration-200 border h-auto",
                isSelected
                  ? "bg-primary/5 border-primary/50 shadow-sm"
                  : "bg-card border-border/40 hover:bg-accent/40 hover:border-border",
                isOccupied && "opacity-50 cursor-not-allowed bg-muted/20 border-transparent",
              )}
            >
              <div className="flex items-center gap-4">
                {/* Radio Circle */}
                <div
                  className={cn(
                    "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/30 group-hover:border-primary/50",
                    isOccupied && "border-muted-foreground/20",
                  )}
                >
                  {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-primary-foreground" />}
                </div>

                {/* Time Range */}
                <span
                  className={cn(
                    "text-base font-medium",
                    isSelected ? "text-foreground" : "text-muted-foreground",
                    isOccupied && "text-muted-foreground/60",
                  )}
                >
                  {timeRange}
                </span>
              </div>

              {/* Status */}
              <span
                className={cn(
                  "text-xs font-bold tracking-widest uppercase",
                  isSelected ? "text-primary" : "text-muted-foreground/70",
                  isOccupied && "text-muted-foreground/40",
                )}
              >
                {isOccupied ? "OCUPADO" : "LIVRE"}
              </span>
            </BrandButton>
          );
        })}
      </div>

      {!showAll && (
        <BrandButton
          type="button"
          variant="ghost"
          size="sm"
          className="w-full text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setShowAll(true)}
        >
          Carregar mais horários
        </BrandButton>
      )}
    </div>
  );
}
