"use client";

import { useDroppable } from "@workspace/forms/dnd";

import { useCalendarDnd } from "./calendar-dnd-context";
import { cn } from "@workspace/ui/lib/utils";

interface DroppableCellProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  date: Date;
  time?: number; // For week/day views, represents hours (e.g., 9.25 for 9:15)
  children?: React.ReactNode;
}

export function DroppableCell({
  id,
  date,
  time,
  children,
  className,
  ...props
}: DroppableCellProps) {
  const { activeEvent } = useCalendarDnd();

  const { setNodeRef, isOver } = useDroppable({
    data: {
      date,
      time,
    },
    id,
  });

  // Format time for display in tooltip (only for debugging)
  const formattedTime =
    time !== undefined
      ? `${Math.floor(time)}:${Math.round((time - Math.floor(time)) * 60)
          .toString()
          .padStart(2, "0")}`
      : null;

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden px-0.5 py-1 data-dragging:bg-accent sm:px-1",
        className,
      )}
      data-dragging={isOver && activeEvent ? true : undefined}
      ref={setNodeRef}
      title={formattedTime ? `${formattedTime}` : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
