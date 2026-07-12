"use client";

import { RiDeleteBinLine } from "@remixicon/react";
import { format, isBefore, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Video, ExternalLink } from "lucide-react";

import type { CalendarEvent, EventColor } from "./types";
import { DefaultEndHour, DefaultStartHour, EndHour, StartHour } from "./constants";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  FluriDialogV2,
  FluriDialogV2Content,
  FluriDialogV2Description,
  FluriDialogV2Header,
  FluriDialogV2Title,
} from "@workspace/brand/overlays/fluri-dialog-v2";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group";
import { Textarea } from "@workspace/ui/components/textarea";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@workspace/ui/components/sheet";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import {
  FluriFieldV2DateSegmentedWithPicker,
  FluriFieldV2TimeSegmented,
} from "@workspace/forms/components/specialized/v2/fluri-fields-v2";

/** Helpers for segmented fields conversion */
const dateToDDMMYYYY = (date: Date | null): string => {
  if (!date || !isValid(date)) return "";
  return format(date, "ddMMyyyy");
};

const ddmmyyyyToDate = (digits: string): Date | null => {
  if (digits.length !== 8) return null;
  const d = parseInt(digits.slice(0, 2), 10);
  const m = parseInt(digits.slice(2, 4), 10);
  const y = parseInt(digits.slice(4, 8), 10);
  if (d && m && y && y > 1900) {
    const newDate = new Date(y, m - 1, d);
    if (!isValid(newDate)) return null;
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }
  return null;
};

const timeToHHMM = (time: string): string => {
  return time.replace(/\D/g, "");
};

const hhmmToTime = (digits: string): string => {
  if (digits.length < 4) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
};

interface EventDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
  meetLink?: string | null;
}

function EventForm({
  event,
  onClose,
  onSave,
  onDelete,
  meetLink,
}: Omit<EventDialogProps, "isOpen">) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState(`${DefaultStartHour}:00`);
  const [endTime, setEndTime] = useState(`${DefaultEndHour}:00`);
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [color, setColor] = useState<EventColor>("sky");
  const [type, setType] = useState<"event" | "appointment">("event");
  const [error, setError] = useState<string | null>(null);

  // Debug log to check what event is being passed
  useEffect(() => {}, [event]);

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setStartDate(new Date());
    setEndDate(new Date());
    setStartTime(`${DefaultStartHour}:00`);
    setEndTime(`${DefaultEndHour}:00`);
    setAllDay(false);
    setLocation("");
    setColor("sky");
    setType("event");
    setError(null);
  }, []);

  const formatTimeForInput = useCallback((date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = Math.floor(date.getMinutes() / 15) * 15;
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (event) {
      setTitle(event.title || "");
      setDescription(event.description || "");

      const start = new Date(event.start);
      const end = new Date(event.end);

      setStartDate(start);
      setEndDate(end);
      setStartTime(formatTimeForInput(start));
      setEndTime(formatTimeForInput(end));
      setAllDay(event.allDay || false);
      setLocation(event.location || "");
      setColor((event.color as EventColor) || "sky");
      setType(event.type || "event");
      setError(null);
    } else {
      resetForm();
    }
  }, [event, formatTimeForInput, resetForm]);

  const handleSave = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!allDay) {
      const [startHours = 0, startMinutes = 0] = startTime.split(":").map(Number);
      const [endHours = 0, endMinutes = 0] = endTime.split(":").map(Number);

      if (
        startHours < StartHour ||
        startHours > EndHour ||
        endHours < StartHour ||
        endHours > EndHour
      ) {
        setError(`Selected time must be between ${StartHour}:00 and ${EndHour}:00`);
        return;
      }

      start.setHours(startHours, startMinutes, 0);
      end.setHours(endHours, endMinutes, 0);
    } else {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    if (isBefore(end, start)) {
      setError("End date cannot be before start date");
      return;
    }

    const eventTitle = title.trim() ? title : "(no title)";

    onSave({
      allDay,
      color,
      description,
      end,
      id: event?.id || "",
      location,
      start,
      title: eventTitle,
      type,
    });
  };

  const handleDelete = () => {
    if (event?.id) {
      onDelete(event.id);
    }
  };

  const colorOptions: Array<{
    value: EventColor;
    label: string;
    bgClass: string;
    borderClass: string;
  }> = [
    {
      bgClass: "bg-sky-400 data-[state=checked]:bg-sky-400",
      borderClass: "border-sky-400 data-[state=checked]:border-sky-400",
      label: "Sky",
      value: "sky",
    },
    {
      bgClass: "bg-amber-400 data-[state=checked]:bg-amber-400",
      borderClass: "border-amber-400 data-[state=checked]:border-amber-400",
      label: "Amber",
      value: "amber",
    },
    {
      bgClass: "bg-violet-400 data-[state=checked]:bg-violet-400",
      borderClass: "border-violet-400 data-[state=checked]:border-violet-400",
      label: "Violet",
      value: "violet",
    },
    {
      bgClass: "bg-rose-400 data-[state=checked]:bg-rose-400",
      borderClass: "border-rose-400 data-[state=checked]:border-rose-400",
      label: "Rose",
      value: "rose",
    },
    {
      bgClass: "bg-emerald-400 data-[state=checked]:bg-emerald-400",
      borderClass: "border-emerald-400 data-[state=checked]:border-emerald-400",
      label: "Emerald",
      value: "emerald",
    },
    {
      bgClass: "bg-orange-400 data-[state=checked]:bg-orange-400",
      borderClass: "border-orange-400 data-[state=checked]:border-orange-400",
      label: "Orange",
      value: "orange",
    },
  ];

  const getFormTitle = () => {
    if (event?.id) {
      return type === "appointment" ? "Edit Appointment" : "Edit Event";
    }
    return type === "appointment" ? "Schedule Appointment" : "Create Event";
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Title only for Sheet logic usage, Logic handles it above */}
      {error && (
        <div className="rounded-md bg-destructive/15 px-3 py-2 text-destructive text-sm">
          {error}
        </div>
      )}
      <div className="grid gap-4 py-4">
        <div className="*:not-first:mt-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" onChange={(e) => setTitle(e.target.value)} value={title} />
        </div>

        <div className="*:not-first:mt-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            value={description}
          />
        </div>

        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="flex-1 *:not-first:mt-1.5">
            <FluriFieldV2DateSegmentedWithPicker
              label="Data de Início"
              value={dateToDDMMYYYY(startDate)}
              onChange={(e: { target: { value: string } }) => {
                const newDate = ddmmyyyyToDate(e.target.value);
                if (newDate) {
                  setStartDate(newDate);
                  if (isBefore(endDate, newDate)) {
                    setEndDate(newDate);
                  }
                  setError(null);
                }
              }}
              fullWidth
            />
          </div>

          {!allDay && (
            <div className="min-w-28 *:not-first:mt-1.5">
              <FluriFieldV2TimeSegmented
                label="Início"
                value={timeToHHMM(startTime)}
                onChange={(e: { target: { value: string } }) => {
                  setStartTime(hhmmToTime(e.target.value));
                }}
                onBlur={() => {}}
                fullWidth
              />
            </div>
          )}
        </div>

        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="flex-1 *:not-first:mt-1.5">
            <FluriFieldV2DateSegmentedWithPicker
              label="Data de Término"
              value={dateToDDMMYYYY(endDate)}
              onChange={(e: { target: { value: string } }) => {
                const newDate = ddmmyyyyToDate(e.target.value);
                if (newDate) {
                  setEndDate(newDate);
                  setError(null);
                }
              }}
              fullWidth
            />
          </div>

          {!allDay && (
            <div className="min-w-28 *:not-first:mt-1.5">
              <FluriFieldV2TimeSegmented
                label="Término"
                value={timeToHHMM(endTime)}
                onChange={(e: { target: { value: string } }) => {
                  setEndTime(hhmmToTime(e.target.value));
                }}
                onBlur={() => {}}
                fullWidth
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            checked={allDay}
            id="all-day"
            onCheckedChange={(checked) => setAllDay(checked === true)}
          />
          <Label htmlFor="all-day">All day</Label>
        </div>

        <div className="*:not-first:mt-1.5">
          <Label htmlFor="location">Location</Label>
          <Input id="location" onChange={(e) => setLocation(e.target.value)} value={location} />
        </div>

        {meetLink && (
          <div className="rounded-lg border bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-blue-600" />
              <Label className="text-sm font-medium">Google Meet</Label>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <a
                href={meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 truncate text-sm text-blue-600 hover:underline"
              >
                {meetLink}
              </a>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(meetLink, "_blank", "noopener,noreferrer")}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <fieldset className="space-y-4">
          <legend className="font-medium text-foreground text-sm leading-none">Etiquette</legend>
          <RadioGroup
            className="flex gap-1.5"
            {...(colorOptions[0]?.value !== undefined
              ? { defaultValue: colorOptions[0].value }
              : {})}
            onValueChange={(value: EventColor) => setColor(value)}
            value={color}
          >
            {colorOptions.map((colorOption) => (
              <RadioGroupItem
                aria-label={colorOption.label}
                className={cn("size-6 shadow-none", colorOption.bgClass, colorOption.borderClass)}
                id={`color-${colorOption.value}`}
                key={colorOption.value}
                value={colorOption.value}
              />
            ))}
          </RadioGroup>
        </fieldset>
      </div>
      <div className="flex flex-row sm:justify-between items-center gap-2">
        {event?.id && (
          <Button aria-label="Delete event" onClick={handleDelete} size="icon" variant="outline">
            <RiDeleteBinLine aria-hidden="true" size={16} />
          </Button>
        )}
        <div className="flex flex-1 justify-end gap-2">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}

export function EventDialog({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
  meetLink,
}: EventDialogProps) {
  const isMobile = useIsMobile();

  // Dialog Title helper to avoid duplication if we needed to pass it down
  // Logic replicates getDialogTitle in EventForm but stateless, actually better to just have generic title or let Form handle it?
  // But DialogHeader is outside Form usually.

  // Workaround: We render Header inside form? No, standard pattern is Header in Dialog/Sheet structure.
  // We can determine title from event prop here.
  const getTitle = () => {
    const type = event?.type || "event";
    if (event?.id) {
      return type === "appointment" ? "Edit Appointment" : "Edit Event";
    }
    return type === "appointment" ? "Schedule Appointment" : "Create Event";
  };

  if (isMobile) {
    return (
      <Sheet onOpenChange={(open) => !open && onClose()} open={isOpen}>
        <SheetContent
          side="bottom"
          className="h-[90vh] sm:max-w-none overflow-y-auto rounded-t-[10px] p-4"
        >
          <SheetHeader className="mb-4">
            <SheetTitle>{getTitle()}</SheetTitle>
          </SheetHeader>
          <EventForm
            event={event}
            onClose={onClose}
            onSave={onSave}
            onDelete={onDelete}
            {...(meetLink !== undefined ? { meetLink } : {})}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <FluriDialogV2 onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <FluriDialogV2Content className="sm:max-w-[425px]">
        <FluriDialogV2Header>
          <FluriDialogV2Title>{getTitle()}</FluriDialogV2Title>
          <FluriDialogV2Description className="sr-only">
            {event?.id ? "Edit the details" : "Create new item"}
          </FluriDialogV2Description>
        </FluriDialogV2Header>
        <EventForm
          event={event}
          onClose={onClose}
          onSave={onSave}
          onDelete={onDelete}
          {...(meetLink !== undefined ? { meetLink } : {})}
        />
      </FluriDialogV2Content>
    </FluriDialogV2>
  );
}
