"use client";

import { endOfWeek, isSameDay, isWithinInterval, startOfWeek } from "date-fns";
import { useEffect, useState } from "react";

import { normalizeTimezone, nowInTimezone } from "@workspace/ui/lib/timezone-datetime";
import { EndHour, StartHour } from "../constants";

export function useCurrentTimeIndicator(
  currentDate: Date,
  view: "day" | "week",
  timezone?: string,
) {
  const resolvedTimezone = normalizeTimezone(timezone);
  const [currentTimePosition, setCurrentTimePosition] = useState<number>(0);
  const [currentTimeVisible, setCurrentTimeVisible] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(() => nowInTimezone(resolvedTimezone));

  useEffect(() => {
    const calculateTimePosition = () => {
      const now = nowInTimezone(resolvedTimezone);
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const totalMinutes = (hours - StartHour) * 60 + minutes;
      const dayStartMinutes = 0; // 12am
      const dayEndMinutes = (EndHour - StartHour) * 60; // 12am next day

      // Calculate position as percentage of day
      const position = ((totalMinutes - dayStartMinutes) / (dayEndMinutes - dayStartMinutes)) * 100;

      // Check if current day is in view based on the calendar view
      let isCurrentTimeVisible = false;

      if (view === "day") {
        isCurrentTimeVisible = isSameDay(now, currentDate);
      } else if (view === "week") {
        const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 0 });
        const endOfWeekDate = endOfWeek(currentDate, { weekStartsOn: 0 });
        isCurrentTimeVisible = isWithinInterval(now, {
          end: endOfWeekDate,
          start: startOfWeekDate,
        });
      }

      setCurrentTimePosition(position);
      setCurrentTimeVisible(isCurrentTimeVisible);
      setCurrentTime(now);
    };

    // Calculate immediately
    calculateTimePosition();

    // Update every minute
    const interval = setInterval(calculateTimePosition, 60000);

    return () => clearInterval(interval);
  }, [currentDate, resolvedTimezone, view]);

  return { currentTimePosition, currentTimeVisible, currentTime };
}
