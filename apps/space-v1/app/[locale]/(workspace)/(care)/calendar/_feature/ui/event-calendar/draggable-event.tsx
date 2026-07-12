"use client";

import { useDraggable } from "@workspace/forms/dnd";
import { CSS } from "@workspace/forms/dnd";
import { differenceInDays } from "date-fns";
import { useRef, useState } from "react";

import type { CalendarEvent } from "./types";
import { EventItem } from "./event-item";
import { useCalendarDnd } from "./calendar-dnd-context";

interface DraggableEventProps {
  event: CalendarEvent & { editable?: boolean };
  view: "month" | "week" | "day";
  timezone?: string;
  showTime?: boolean;
  onClick?: (e: React.MouseEvent, triggerElement?: HTMLElement) => void;
  height?: number;
  isMultiDay?: boolean;
  multiDayWidth?: number;
  isFirstDay?: boolean;
  isLastDay?: boolean;
  "aria-hidden"?: boolean | "true" | "false";
}

export function DraggableEvent({
  event,
  view,
  timezone,
  showTime,
  onClick,
  height,
  isMultiDay,
  multiDayWidth,
  isFirstDay = true,
  isLastDay = true,
  "aria-hidden": ariaHidden,
}: DraggableEventProps) {
  const { activeId } = useCalendarDnd();
  const elementRef = useRef<HTMLDivElement>(null);
  const [dragHandlePosition, setDragHandlePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Check if event is editable (default to true if not specified)
  const isEditable = event.editable !== false;

  // Check if this is a multi-day event
  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);
  const isMultiDayEvent = isMultiDay || event.allDay || differenceInDays(eventEnd, eventStart) >= 1;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    data: {
      dragHandlePosition,
      event,
      height: height || elementRef.current?.offsetHeight || null,
      isFirstDay,
      isLastDay,
      isMultiDay: isMultiDayEvent,
      multiDayWidth: multiDayWidth,
      view,
    },
    id: `${event.id}-${view}`,
    disabled: !isEditable,
  });

  // Handle mouse down to track where on the event the user clicked
  const handleMouseDown = (e: React.MouseEvent) => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      setDragHandlePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  // Don't render if this event is being dragged
  if (isDragging || activeId === `${event.id}-${view}`) {
    return <div className="opacity-0" ref={setNodeRef} style={{ height: height || "auto" }} />;
  }

  const style = transform
    ? {
        height: height || "auto",
        transform: CSS.Translate.toString(transform),
        width: isMultiDayEvent && multiDayWidth ? `${multiDayWidth}%` : undefined,
      }
    : {
        height: height || "auto",
        width: isMultiDayEvent && multiDayWidth ? `${multiDayWidth}%` : undefined,
      };

  // Handle touch start to track where on the event the user touched
  const handleTouchStart = (e: React.TouchEvent) => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      if (touch) {
        setDragHandlePosition({
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
        });
      }
    }
  };

  // If not editable, render without drag functionality
  if (!isEditable) {
    return (
      <div style={{ height: height || "auto" }}>
        <EventItem
          {...(ariaHidden !== undefined ? { "aria-hidden": ariaHidden } : {})}
          event={event}
          isFirstDay={isFirstDay}
          isLastDay={isLastDay}
          {...(onClick ? { onClick } : {})}
          {...(showTime !== undefined ? { showTime } : {})}
          {...(timezone !== undefined ? { timezone } : {})}
          view={view}
        />
      </div>
    );
  }

  return (
    <div
      className="touch-none"
      ref={(node) => {
        setNodeRef(node);
        if (elementRef) elementRef.current = node;
      }}
      style={style}
    >
      <EventItem
        {...(ariaHidden !== undefined ? { "aria-hidden": ariaHidden } : {})}
        dndAttributes={attributes}
        {...(listeners !== undefined ? { dndListeners: listeners } : {})}
        event={event}
        isDragging={isDragging}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        {...(onClick ? { onClick } : {})}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        {...(showTime !== undefined ? { showTime } : {})}
        {...(timezone !== undefined ? { timezone } : {})}
        view={view}
      />
    </div>
  );
}
