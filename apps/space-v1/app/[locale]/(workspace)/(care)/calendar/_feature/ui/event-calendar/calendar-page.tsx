"use client";

import { ChevronLeftIcon, ChevronRightIcon, Menu, Calendar as CalendarIcon } from "lucide-react";
import { addDays, setHours, setMinutes, subDays, format, isSameDay, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { DayButton, useDayPicker, type MonthCaptionProps } from "react-day-picker";

import { EventCalendar } from "./event-calendar";
import type { CalendarEvent } from "./types";
import type { CalendarView } from "./types";
import type { EventColor } from "./types";
import type { CalendarSource } from "./types";
import type { CalendarEventFull } from "./event-quick-view-popover";
import type { SeriesEditScope } from "./event-quick-view-popover";
import { MobileCalendarView } from "./mobile-calendar-view";
import { MobileCalendarFiltersSheet } from "./mobile-calendar-filters-sheet";
import { EventQuickViewPopover } from "./event-quick-view-popover";
import { DeleteEventConfirmationDialog } from "./delete-event-confirmation-dialog";
import { SeriesEditScopeDialog } from "./series-edit-scope-dialog";
import { getEditEventInitialValues } from "./edit-event-initial-values";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { DefaultStartHour } from "./constants";
import { Calendar } from "@workspace/ui/components/calendar";
import { Separator } from "@workspace/ui/components/separator";
import { Button } from "@workspace/ui/components/button";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { cn } from "@workspace/ui/lib/utils";
import {
  EventCreationModal,
  type EventCreationFormValues,
  type PatientOption,
  type LocationOption,
  type ServiceOption,
} from "./event-creation-modal";
import { normalizeTimezone, nowInTimezone } from "@workspace/ui/lib/timezone-datetime";
import {
  validateEventTiming,
  getConflictMessage,
  type CalendarConflict,
} from "./event-modal-validations";
import {
  FiltersBar,
  type ActiveFilter,
  type FilterDefinition,
} from "@workspace/brand/patterns/components/filters";

export interface CalendarPageLayoutProps {
  calendars?: CalendarSource[];
  className?: string;
  timezone?: string;
  initialEvents?: CalendarEvent[];
  initialView?: CalendarView;
  /**
   * Optional callback fired whenever the internal events state changes.
   * Useful to sync the demo layout with an external store.
   */
  onEventsChange?: (events: CalendarEvent[]) => void;
  /**
   * Optional callback for when an event is added.
   * If provided, this will override the default internal handler.
   */
  onEventAdd?: (event: CalendarEvent) => void;
  /**
   * Optional callback for when an event is updated.
   * If provided, this will override the default internal handler.
   */
  onEventUpdate?: (event: CalendarEvent) => void;
  /**
   * Optional callback for when an event is deleted.
   * If provided, this will override the default internal handler.
   */
  onEventDelete?: (eventId: string) => void;
  /**
   * Optional callback for when a series event is updated with scope.
   * Required for proper series editing support.
   */
  onSeriesUpdate?: (
    eventId: string,
    seriesId: string,
    updates: Record<string, unknown>,
    scope: SeriesEditScope,
  ) => Promise<void>;
  /**
   * Optional callback for when a series event is deleted with scope.
   * Required for proper series deletion support.
   */
  onSeriesDelete?: (eventId: string, seriesId: string, scope: SeriesEditScope) => Promise<void>;
  /**
   * Optional function to check for conflicts before saving.
   */
  onCheckConflicts?: (
    startDatetime: string,
    endDatetime: string,
    excludeEventId?: string,
  ) => Promise<CalendarConflict[]>;
  /**
   * Optional function to get Google Meet link for an event.
   * Should return the Meet link or null if not available.
   */
  getMeetLink?: (eventId: string) => Promise<string | null> | string | null;
  /**
   * Optional callback for when an event is created from the modal.
   * If provided, it overrides the default modal handling.
   */
  onEventCreate?: (data: EventCreationFormValues) => void | Promise<void>;
  /**
   * Optional callback for converting an existing single event into a recurring series.
   */
  onEventConvertToSeries?: (
    event: CalendarEventFull,
    data: EventCreationFormValues,
  ) => Promise<void>;
  getEditInitialValues?: (event: CalendarEventFull) => Partial<EventCreationFormValues>;
  /**
   * Optional data for the event creation modal (patients, services, locations).
   */
  eventCreationOptions?: {
    patients?: PatientOption[];
    locations?: LocationOption[];
    services?: ServiceOption[];
    isLoadingPatients?: boolean;
    isLoadingLocations?: boolean;
    isLoadingServices?: boolean;
    hasGoogleMeetAccess?: boolean;
  };
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

const defaultCalendars: CalendarSource[] = [
  { color: "sky", id: "sessions", label: "Sessões" },
  { color: "violet", id: "supervisions", label: "Supervisões" },
  { color: "rose", id: "birthdays", label: "Aniversários" },
  { color: "rose", id: "blocks", label: "Bloqueio de Horários" },
];

const defaultEvents: CalendarEvent[] = [
  {
    allDay: true,
    calendarId: "holidays",
    color: "amber",
    description: "Folga combinada com a equipe",
    end: addDays(new Date(), 1),
    id: "holiday-1",
    start: addDays(new Date(), 1),
    title: "Feriado local",
  },
  {
    calendarId: "sessions",
    color: "sky",
    description: "Sessão individual",
    end: setMinutes(setHours(new Date(), 11), 0),
    id: "session-1",
    location: "Sala 2",
    start: setMinutes(setHours(new Date(), 10), 0),
    title: "Consulta - Juliana",
  },
  {
    calendarId: "sessions",
    color: "emerald",
    description: "Sessão de acompanhamento",
    end: setMinutes(setHours(addDays(new Date(), 2), 15), 0),
    id: "session-2",
    location: "Online",
    start: setMinutes(setHours(addDays(new Date(), 2), 14), 0),
    title: "Retorno - Carlos",
  },
  {
    calendarId: "birthdays",
    color: "rose",
    description: "Equipe preparou bolo e café",
    end: addDays(new Date(), 6),
    id: "birthday-1",
    start: addDays(new Date(), 6),
    title: "Aniversário da Ana",
  },
  {
    allDay: true,
    calendarId: "reminders",
    color: "violet",
    description: "Separar tempo para revisar metas do trimestre",
    end: addDays(new Date(), 4),
    id: "reminder-1",
    start: addDays(new Date(), 4),
    title: "Revisão trimestral",
  },
  {
    calendarId: "sessions",
    color: "orange",
    description: "Preparar documentação para o conselho",
    end: setMinutes(setHours(subDays(new Date(), 1), 17), 30),
    id: "session-3",
    location: "Sala 1",
    start: setMinutes(setHours(subDays(new Date(), 1), 16), 30),
    title: "Supervisão de casos",
  },
];

export function CalendarPageLayout({
  calendars = defaultCalendars,
  className,
  timezone,
  initialEvents = defaultEvents,
  initialView = "month",
  onEventsChange,
  onEventAdd: externalOnEventAdd,
  onEventUpdate: externalOnEventUpdate,
  onEventDelete: externalOnEventDelete,
  onSeriesUpdate,
  onSeriesDelete,
  onCheckConflicts,
  getMeetLink,
  onEventCreate,
  onEventConvertToSeries,
  getEditInitialValues,
  eventCreationOptions,
}: CalendarPageLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const resolvedTimezone = useMemo(() => normalizeTimezone(timezone), [timezone]);

  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const eventsRef = useRef(events);
  const optimisticMutationRef = useRef<string | null>(null);

  // URL State Management
  const viewParam = searchParams?.get("view") as CalendarView | null;
  const dateParam = searchParams?.get("date");

  const [view, setViewState] = useState<CalendarView>(viewParam ?? initialView ?? "month");
  const [date, setDateState] = useState<Date>(() =>
    dateParam ? new Date(dateParam) : nowInTimezone(resolvedTimezone),
  );

  // Ensure date is valid (react-day-picker crashing fix)
  useEffect(() => {
    if (!isValid(date)) {
      setDateState(nowInTimezone(resolvedTimezone));
    }
  }, [date, resolvedTimezone]);

  const [selectedCalendars, setSelectedCalendars] = useState<Set<string>>(
    () => new Set(calendars.map((calendar) => calendar.id)),
  );

  // Remove duplicate filters sheet state for mobile old version
  // const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [meetLink, setMeetLink] = useState<string | null>(null);
  const [isEventCreationModalOpen, setIsEventCreationModalOpen] = useState(false);
  const [eventCreationInitialValues, setEventCreationInitialValues] =
    useState<Partial<EventCreationFormValues> | null>(null);

  // Quick View Popover State
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quickViewTriggerRef, setQuickViewTriggerRef] = useState<HTMLElement | null>(null);

  // Delete Confirmation Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEventFull | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEventFull | null>(null);

  // Series Edit Scope Dialog State
  const [seriesScopeDialogOpen, setSeriesScopeDialogOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<Partial<EventCreationFormValues> | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Handle filters change from FiltersBar
  const handleFiltersChange = (_filters: ActiveFilter[]) => {
    // Filters change handler
  };

  const {
    patients,
    locations,
    services,
    isLoadingPatients,
    isLoadingLocations,
    isLoadingServices,
    hasGoogleMeetAccess,
  } = eventCreationOptions ?? {};

  useEffect(() => {
    eventsRef.current = initialEvents;
    setEvents(initialEvents);
  }, [initialEvents]);

  // Sync state with URL params
  const setView = useCallback(
    (newView: CalendarView) => {
      setViewState(newView);
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("view", newView);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const setDate = useCallback(
    (newDate: Date) => {
      if (!isValid(newDate)) return;
      setDateState(newDate);
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("date", newDate.toISOString());
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const defaultCalendarId = useMemo(() => calendars[0]?.id, [calendars]);

  const getCalendarIdForEvent = () => {
    const selected = calendars.find((calendar) => selectedCalendars.has(calendar.id));
    return selected?.id ?? defaultCalendarId ?? "default";
  };

  const getColorForCalendar = (calendarId?: string, fallback?: EventColor) => {
    const calendarColor = calendars.find((calendar) => calendar.id === calendarId)?.color;
    return calendarColor ?? fallback ?? "sky";
  };

  const updateEvents = (updater: (previous: CalendarEvent[]) => CalendarEvent[]) => {
    setEvents((previous) => {
      const next = updater(previous);
      eventsRef.current = next;
      onEventsChange?.(next);
      return next;
    });
  };

  const restoreEventsSnapshot = useCallback(
    (snapshot: CalendarEvent[]) => {
      eventsRef.current = snapshot;
      setEvents(snapshot);
      onEventsChange?.(snapshot);
    },
    [onEventsChange],
  );

  const beginOptimisticMutation = useCallback((mutationKey: string): CalendarEvent[] | null => {
    if (optimisticMutationRef.current) {
      return null;
    }

    optimisticMutationRef.current = mutationKey;
    return eventsRef.current;
  }, []);

  const endOptimisticMutation = useCallback((mutationKey: string) => {
    if (optimisticMutationRef.current === mutationKey) {
      optimisticMutationRef.current = null;
    }
  }, []);

  const handleEventAdd = async (event: CalendarEvent) => {
    const calendarId = event.calendarId !== undefined ? event.calendarId : getCalendarIdForEvent();
    const color = getColorForCalendar(calendarId, event.color);
    // Ensure calendarId and color are always defined strings
    const safeCalendarId = calendarId ?? "default";
    const safeColor = color ?? "sky";
    const eventWithMetadata: CalendarEvent = {
      ...event,
      calendarId: safeCalendarId,
      color: safeColor,
      ...(event.description !== undefined ? { description: event.description } : {}),
    };

    // If external handler is provided, use it (for database persistence)
    if (externalOnEventAdd) {
      await externalOnEventAdd(eventWithMetadata);
    } else {
      // Otherwise, just update local state
      updateEvents((previous) => [...previous, eventWithMetadata]);
    }

    // Close dialog after adding
    setIsEventCreationModalOpen(false);
    setSelectedEvent(null);
  };

  const handleEventUpdate = async (updatedEvent: CalendarEvent) => {
    // If external handler is provided, use it (for database persistence)
    if (externalOnEventUpdate) {
      await externalOnEventUpdate(updatedEvent);
    } else {
      // Otherwise, just update local state
      updateEvents((previous) =>
        previous.map((event) =>
          event.id === updatedEvent.id
            ? {
                ...event,
                ...updatedEvent,
                calendarId:
                  updatedEvent.calendarId !== undefined
                    ? updatedEvent.calendarId
                    : (event.calendarId ?? getCalendarIdForEvent()),
                color: updatedEvent.color ?? event.color ?? "sky",
                ...(updatedEvent.description !== undefined
                  ? { description: updatedEvent.description }
                  : {}),
              }
            : event,
        ),
      );
    }
  };

  const handleEventDelete = async (eventId: string) => {
    // If external handler is provided, use it (for database persistence)
    if (externalOnEventDelete) {
      await externalOnEventDelete(eventId);
    } else {
      // Otherwise, just update local state
      updateEvents((previous) => previous.filter((event) => event.id !== eventId));
    }
  };

  const visibleEvents = useMemo(() => {
    if (selectedCalendars.size === 0) return [];
    // Only filter for event calendar. Mobile calendar view handles its own filtering inside for now to support dots
    return events.filter((event) => !event.calendarId || selectedCalendars.has(event.calendarId));
  }, [events, selectedCalendars]);

  // Mobile uses the raw events because it needs to calculate dots for dates that might not be in "visibleEvents" if we want to show all dots?
  // No, Mobile should also respect filters. So we pass logic down.

  const toggleCalendar = (calendarId: string) => {
    setSelectedCalendars((prev) => {
      const next = new Set(prev);
      if (next.has(calendarId)) {
        next.delete(calendarId);
      } else {
        next.add(calendarId);
      }
      return next;
    });
  };

  const toggleAllCalendars = () => {
    setSelectedCalendars((prev) => {
      if (prev.size === calendars.length) {
        return new Set();
      }
      return new Set(calendars.map((calendar) => calendar.id));
    });
  };

  const handleEventCreationSubmit = async (data: EventCreationFormValues) => {
    if (onEventCreate) {
      await onEventCreate(data);
      return;
    }

    const baseDate = data.date ?? date ?? nowInTimezone(resolvedTimezone);
    const [startHours = 0, startMinutes = 0] = data.startTime.split(":").map(Number);
    const [endHours = 0, endMinutes = 0] = data.endTime.split(":").map(Number);
    const start = data.allDay
      ? new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 0, 0, 0, 0)
      : setMinutes(setHours(baseDate, startHours), startMinutes);
    const end = data.allDay
      ? new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 23, 59, 59, 999)
      : setMinutes(setHours(baseDate, endHours), endMinutes);
    const calendarId = getCalendarIdForEvent();
    const color = getColorForCalendar(calendarId);

    const newEvent: CalendarEvent = {
      calendarId,
      color,
      title: data.title,
      ...(data.notes !== undefined && data.notes !== "" ? { description: data.notes } : {}),
      start,
      end,
      id: "",
      type: "event",
      allDay: data.allDay ?? false,
    };

    await handleEventAdd(newEvent);
  };

  // Custom DayButton for mini calendar with rounded-full styling (Desktop Sidebar)
  const todayInUserTimezone = useMemo(() => nowInTimezone(resolvedTimezone), [resolvedTimezone]);

  const MiniCalendarDayButton = React.useCallback(
    ({ className, day, modifiers, ...props }: React.ComponentProps<typeof DayButton>) => {
      const isTodayDate = isSameDay(day.date, todayInUserTimezone);
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
    [todayInUserTimezone],
  );

  // Custom MonthCaption component for Desktop Sidebar
  const MiniCalendarCaption = React.useCallback((props: MonthCaptionProps) => {
    const { calendarMonth } = props;
    const { previousMonth, nextMonth, goToMonth } = useDayPicker();

    const displayMonth = calendarMonth.date;

    // Validate that displayMonth is a valid Date
    if (!displayMonth || !isValid(displayMonth)) {
      return <div className="h-8" />;
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
            className="border-0 hover:bg-muted hover:text-foreground size-8 p-0 cursor-pointer rounded-full"
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
            className="border-0 hover:bg-muted hover:text-foreground size-8 p-0 cursor-pointer rounded-full"
            disabled={!nextMonth}
            onClick={() => nextMonth && goToMonth(nextMonth)}
            aria-label="Go to next month"
          >
            <ChevronRightIcon size={16} />
          </Button>
        </nav>
      </div>
    );
  }, []);

  // Handle event selection (e.g. clicking an existing event)
  const handleEventSelect = useCallback(
    (event: CalendarEvent, triggerElement?: HTMLElement) => {
      setSelectedEvent(event);

      // Save reference to clicked element for popover positioning
      if (triggerElement) {
        setQuickViewTriggerRef(triggerElement);
      }

      // Open quick view popover
      setQuickViewOpen(true);

      // Fetch Google Meet link if available
      if (getMeetLink && event.id) {
        const fetchMeetLink = async () => {
          const link = await getMeetLink(event.id);
          setMeetLink(link);
        };
        void fetchMeetLink();
      }
    },
    [getMeetLink],
  );

  // Handle edit event from quick view
  const handleEditEvent = useCallback((event: CalendarEventFull) => {
    setEditingEvent(event);
    setIsEditModalOpen(true);
    setQuickViewOpen(false);
  }, []);

  // Handle delete event trigger from quick view
  const handleDeleteEventTrigger = useCallback((event: CalendarEventFull) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
    setQuickViewOpen(false);
  }, []);

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(
    async (scope?: SeriesEditScope) => {
      if (!eventToDelete) return;

      const mutationKey = `delete:${eventToDelete.id}`;
      const previousEvents = beginOptimisticMutation(mutationKey);
      if (!previousEvents) return;

      setIsDeleting(true);
      try {
        const eventFull = eventToDelete as CalendarEventFull;
        const seriesId = eventFull.series_id;
        const eventIdToDelete = eventToDelete.id;

        // If it's a series event and we have the onSeriesDelete handler
        if (seriesId && scope && onSeriesDelete) {
          // Optimistic update based on scope
          if (scope === "this") {
            // Remove only this occurrence
            updateEvents((previous) => previous.filter((event) => event.id !== eventIdToDelete));
          } else if (scope === "this_and_following") {
            // Remove this and following events (events with start >= this event's start)
            const thisEventStart = new Date(eventToDelete.start);
            updateEvents((previous) =>
              previous.filter((event) => {
                const eventFull = event as CalendarEventFull;
                if (eventFull.series_id !== seriesId) return true;
                return new Date(event.start) < thisEventStart;
              }),
            );
          } else if (scope === "all") {
            // Remove all events in the series
            updateEvents((previous) =>
              previous.filter((event) => {
                const eventFull = event as CalendarEventFull;
                return eventFull.series_id !== seriesId;
              }),
            );
          }

          await onSeriesDelete(eventIdToDelete, seriesId, scope);
        } else {
          // Single event deletion - optimistic update
          updateEvents((previous) => previous.filter((event) => event.id !== eventIdToDelete));
          await handleEventDelete(eventIdToDelete);
        }

        setDeleteDialogOpen(false);
        setEventToDelete(null);
        setSelectedEvent(null);
      } catch (error) {
        // On error, revert to the exact pre-mutation local state
        restoreEventsSnapshot(previousEvents);
      } finally {
        setIsDeleting(false);
        endOptimisticMutation(mutationKey);
      }
    },
    [
      beginOptimisticMutation,
      endOptimisticMutation,
      eventToDelete,
      handleEventDelete,
      onSeriesDelete,
      restoreEventsSnapshot,
    ],
  );

  // Handle edit modal submit
  const handleEditSubmit = useCallback(
    async (data: EventCreationFormValues) => {
      if (!editingEvent) return;

      const eventFull = editingEvent as CalendarEventFull;
      const isConvertingToSeries = data.recurrenceRule && !eventFull.series_id;

      // If it's a series event, show scope dialog
      if (eventFull.series_id) {
        setPendingUpdate(data);
        setSeriesScopeDialogOpen(true);
        return;
      }

      // If converting from single to recurring, create series and link the current event
      if (isConvertingToSeries && onEventConvertToSeries) {
        const mutationKey = `convert-to-series:${editingEvent.id}`;
        const previousEvents = beginOptimisticMutation(mutationKey);
        if (!previousEvents) return;

        setIsSavingEdit(true);
        try {
          await onEventConvertToSeries(eventFull, data);
          setIsEditModalOpen(false);
          setEditingEvent(null);
        } catch (error) {
          // On error, revert to the exact pre-mutation local state
          restoreEventsSnapshot(previousEvents);
        } finally {
          setIsSavingEdit(false);
          endOptimisticMutation(mutationKey);
        }
        return;
      }

      // Single event: save directly
      const mutationKey = `edit:${editingEvent.id}`;
      const previousEvents = beginOptimisticMutation(mutationKey);
      if (!previousEvents) return;

      setIsSavingEdit(true);
      try {
        const [startHours = 0, startMinutes = 0] = data.startTime.split(":").map(Number);
        const [endHours = 0, endMinutes = 0] = data.endTime.split(":").map(Number);
        const start = data.allDay
          ? new Date(data.date.getFullYear(), data.date.getMonth(), data.date.getDate(), 0, 0, 0, 0)
          : setMinutes(setHours(new Date(data.date), startHours), startMinutes);
        const end = data.allDay
          ? new Date(
              data.date.getFullYear(),
              data.date.getMonth(),
              data.date.getDate(),
              23,
              59,
              59,
              999,
            )
          : setMinutes(setHours(new Date(data.date), endHours), endMinutes);

        const locationValue =
          editingEvent.location ??
          locations?.find((location) => location.id === data.locationId)?.name;
        const updatedEvent: CalendarEvent = {
          ...editingEvent,
          title: data.title,
          ...(data.notes !== undefined && data.notes !== "" ? { description: data.notes } : {}),
          start,
          end,
          allDay: data.allDay ?? false,
          ...(locationValue !== undefined ? { location: locationValue } : {}),
        };

        // Optimistic update for single event
        updateEvents((prev) =>
          prev.map((event) => (event.id === editingEvent.id ? updatedEvent : event)),
        );

        await handleEventUpdate(updatedEvent);
        setIsEditModalOpen(false);
        setEditingEvent(null);
      } catch (error) {
        // On error, revert to the exact pre-mutation local state
        restoreEventsSnapshot(previousEvents);
      } finally {
        setIsSavingEdit(false);
        endOptimisticMutation(mutationKey);
      }
    },
    [
      beginOptimisticMutation,
      editingEvent,
      endOptimisticMutation,
      handleEventUpdate,
      locations,
      onEventConvertToSeries,
      restoreEventsSnapshot,
    ],
  );

  // Helper to rebuild event datetime preserving original date but applying new time
  const buildEventWithNewTime = useCallback(
    (
      event: CalendarEvent,
      newStartTime: string | undefined,
      newEndTime: string | undefined,
      newAllDay: boolean | undefined,
    ): { start: Date; end: Date; allDay: boolean } => {
      const isAllDay = (newAllDay ?? event.allDay) || false;
      const eventDate = new Date(event.start);
      const originalEnd = new Date(event.end);
      const originalDurationMs = originalEnd.getTime() - eventDate.getTime();

      if (isAllDay) {
        // All-day: preserve the event's original date, set to 00:00-23:59:59.999
        return {
          start: new Date(
            eventDate.getFullYear(),
            eventDate.getMonth(),
            eventDate.getDate(),
            0,
            0,
            0,
            0,
          ),
          end: new Date(
            eventDate.getFullYear(),
            eventDate.getMonth(),
            eventDate.getDate(),
            23,
            59,
            59,
            999,
          ),
          allDay: true,
        };
      }

      const hasStartTime = typeof newStartTime === "string" && newStartTime.length > 0;
      const hasEndTime = typeof newEndTime === "string" && newEndTime.length > 0;
      const [startHours = eventDate.getHours(), startMinutes = eventDate.getMinutes()] = (
        newStartTime ?? ""
      )
        .split(":")
        .map(Number);
      const rebuiltStart = hasStartTime
        ? setMinutes(
            setHours(
              new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()),
              startHours,
            ),
            startMinutes,
          )
        : new Date(event.start);

      if (!hasEndTime) {
        return {
          start: rebuiltStart,
          end: hasStartTime ? new Date(rebuiltStart.getTime() + originalDurationMs) : originalEnd,
          allDay: false,
        };
      }

      const [endHours = originalEnd.getHours(), endMinutes = originalEnd.getMinutes()] = (
        newEndTime ?? ""
      )
        .split(":")
        .map(Number);

      // Preserve each event's original calendar date, apply new time-of-day
      return {
        start: rebuiltStart,
        end: setMinutes(
          setHours(
            new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()),
            endHours,
          ),
          endMinutes,
        ),
        allDay: false,
      };
    },
    [],
  );

  // Handle series scope confirmation
  const handleSeriesScopeConfirm = useCallback(
    async (scope: SeriesEditScope) => {
      if (!editingEvent || !pendingUpdate) return;

      const mutationKey = `series-edit:${editingEvent.id}:${scope}`;
      const previousEvents = beginOptimisticMutation(mutationKey);
      if (!previousEvents) return;

      setIsSavingEdit(true);

      // Prepare optimistic update
      const eventFull = editingEvent as CalendarEventFull;
      const seriesId = eventFull.series_id;
      const eventId = editingEvent.id;

      // Calculate new start/end for the edited event itself (scope === "this")
      const [startHours = 0, startMinutes = 0] = (pendingUpdate.startTime ?? "")
        .split(":")
        .map(Number);
      const [endHours = 0, endMinutes = 0] = (pendingUpdate.endTime ?? "").split(":").map(Number);
      const baseDate = pendingUpdate.date ?? new Date(editingEvent.start);
      const editedEventStart = pendingUpdate.allDay
        ? new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 0, 0, 0, 0)
        : setMinutes(setHours(new Date(baseDate), startHours), startMinutes);
      const editedEventEnd = pendingUpdate.allDay
        ? new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 23, 59, 59, 999)
        : setMinutes(setHours(new Date(baseDate), endHours), endMinutes);

      // Apply optimistic update
      const optimisticEvent: CalendarEvent = {
        ...editingEvent,
        title: pendingUpdate.title ?? editingEvent.title,
        start: editedEventStart,
        end: editedEventEnd,
        allDay: (pendingUpdate.allDay ?? editingEvent.allDay) || false,
        ...(pendingUpdate.notes !== undefined && pendingUpdate.notes !== ""
          ? { description: pendingUpdate.notes }
          : {}),
      };

      // Update local state optimistically based on scope
      if (scope === "this") {
        updateEvents((prev) =>
          prev.map((event) => (event.id === eventId ? optimisticEvent : event)),
        );
      } else if (scope === "this_and_following" && seriesId) {
        const thisEventStart = new Date(editingEvent.start);
        updateEvents((prev) =>
          prev.map((event) => {
            const eventFull = event as CalendarEventFull;
            if (eventFull.series_id !== seriesId) return event;
            if (new Date(event.start) < thisEventStart) return event;
            // For series scope, preserve each event's own date, apply new time-of-day
            const { start, end, allDay } = buildEventWithNewTime(
              event,
              pendingUpdate.startTime,
              pendingUpdate.endTime,
              pendingUpdate.allDay,
            );
            return {
              ...event,
              title: pendingUpdate.title ?? event.title,
              start,
              end,
              allDay,
              ...(pendingUpdate.notes !== undefined && pendingUpdate.notes !== ""
                ? { description: pendingUpdate.notes }
                : {}),
            };
          }),
        );
      } else if (scope === "all" && seriesId) {
        updateEvents((prev) =>
          prev.map((event) => {
            const eventFull = event as CalendarEventFull;
            if (eventFull.series_id !== seriesId) return event;
            // For series scope, preserve each event's own date, apply new time-of-day
            const { start, end, allDay } = buildEventWithNewTime(
              event,
              pendingUpdate.startTime,
              pendingUpdate.endTime,
              pendingUpdate.allDay,
            );
            return {
              ...event,
              title: pendingUpdate.title ?? event.title,
              start,
              end,
              allDay,
              ...(pendingUpdate.notes !== undefined && pendingUpdate.notes !== ""
                ? { description: pendingUpdate.notes }
                : {}),
            };
          }),
        );
      }

      try {
        // If it's a series event and we have the onSeriesUpdate handler
        if (seriesId && onSeriesUpdate) {
          const updates: Record<string, unknown> = {
            title: pendingUpdate.title,
            description: pendingUpdate.notes,
          };

          // Add time-related updates if provided
          if (pendingUpdate.startTime && pendingUpdate.date) {
            const [hours, minutes] = pendingUpdate.startTime.split(":").map(Number);
            const startDate = new Date(pendingUpdate.date);
            startDate.setHours(hours ?? 0, minutes ?? 0, 0, 0);
            updates.startTime = pendingUpdate.startTime;
          }

          if (pendingUpdate.endTime) {
            updates.endTime = pendingUpdate.endTime;
          }

          if (pendingUpdate.durationMinutes) {
            updates.durationMinutes = pendingUpdate.durationMinutes;
          }

          if (typeof pendingUpdate.allDay === "boolean") {
            updates.allDay = pendingUpdate.allDay;
          }

          if (pendingUpdate.recurrenceRule) {
            updates.rrule = pendingUpdate.recurrenceRule;
          }

          await onSeriesUpdate(eventId, seriesId, updates, scope);
        } else {
          // Fallback to regular event update
          await handleEventUpdate(optimisticEvent);
        }

        setSeriesScopeDialogOpen(false);
        setIsEditModalOpen(false);
        setPendingUpdate(null);
        setEditingEvent(null);
      } catch (error) {
        // On error, revert to the exact pre-mutation local state
        restoreEventsSnapshot(previousEvents);
      } finally {
        setIsSavingEdit(false);
        endOptimisticMutation(mutationKey);
      }
    },
    [
      beginOptimisticMutation,
      buildEventWithNewTime,
      editingEvent,
      endOptimisticMutation,
      handleEventUpdate,
      onSeriesUpdate,
      pendingUpdate,
      restoreEventsSnapshot,
    ],
  );

  // Handle slot selection (clicking or dragging on empty space)
  const handleEventCreateTrigger = useCallback((startTime: Date, endTime?: Date) => {
    const values: Partial<EventCreationFormValues> = {
      date: startTime,
      startTime: format(startTime, "HH:mm"),
    };

    if (endTime) {
      values.endTime = format(endTime, "HH:mm");
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      values.durationMinutes = duration;
    }

    setEventCreationInitialValues(values);
    setIsEventCreationModalOpen(true);
  }, []);

  if (isMobile) {
    return (
      <>
        <MobileCalendarView
          events={events} // Pass all events, let component filter/map them for dots
          calendars={calendars}
          selectedCalendars={selectedCalendars}
          onToggleCalendar={toggleCalendar}
          onToggleAllCalendars={toggleAllCalendars}
          date={date}
          onDateChange={setDate}
          onEventSelect={handleEventSelect}
          onEventAdd={() => setIsEventCreationModalOpen(true)}
          timezone={resolvedTimezone}
        />

        <EventCreationModal
          isOpen={isEventCreationModalOpen}
          onClose={() => {
            setIsEventCreationModalOpen(false);
            setEventCreationInitialValues(null);
          }}
          onSubmit={handleEventCreationSubmit}
          timezone={resolvedTimezone}
          header={{
            showBack: true,
            onBack: () => {
              setIsEventCreationModalOpen(false);
              setEventCreationInitialValues(null);
            },
          }}
          {...(eventCreationInitialValues !== null
            ? { initialValues: eventCreationInitialValues }
            : {})}
          {...(patients ? { patients } : {})}
          {...(locations ? { locations } : {})}
          {...(services ? { services } : {})}
          {...(isLoadingPatients !== undefined ? { isLoadingPatients } : {})}
          {...(isLoadingLocations !== undefined ? { isLoadingLocations } : {})}
          {...(isLoadingServices !== undefined ? { isLoadingServices } : {})}
          {...(hasGoogleMeetAccess !== undefined ? { hasGoogleMeetAccess } : {})}
        />

        {/* Quick View Popover (Sheet on mobile) */}
        {selectedEvent && quickViewTriggerRef && (
          <EventQuickViewPopover
            event={selectedEvent as CalendarEventFull}
            triggerRef={{ current: quickViewTriggerRef }}
            open={quickViewOpen}
            onOpenChange={setQuickViewOpen}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEventTrigger}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteEventConfirmationDialog
          event={eventToDelete}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
          seriesEventCount={1}
        />

        {/* Series Edit Scope Dialog */}
        {editingEvent && (
          <SeriesEditScopeDialog
            open={seriesScopeDialogOpen}
            onOpenChange={setSeriesScopeDialogOpen}
            eventDate={new Date(editingEvent.start)}
            totalEventCount={1}
            onConfirm={handleSeriesScopeConfirm}
            isSaving={isSavingEdit}
          />
        )}

        {/* Edit Modal */}
        {isEditModalOpen && editingEvent && (
          <EventCreationModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingEvent(null);
            }}
            onSubmit={handleEditSubmit}
            timezone={resolvedTimezone}
            initialValues={{
              ...getEditEventInitialValues(editingEvent, locations),
              ...(getEditInitialValues ? getEditInitialValues(editingEvent) : {}),
            }}
            {...(patients ? { patients } : {})}
            {...(locations ? { locations } : {})}
            {...(services ? { services } : {})}
            {...(isLoadingPatients !== undefined ? { isLoadingPatients } : {})}
            {...(isLoadingLocations !== undefined ? { isLoadingLocations } : {})}
            {...(isLoadingServices !== undefined ? { isLoadingServices } : {})}
            {...(hasGoogleMeetAccess !== undefined ? { hasGoogleMeetAccess } : {})}
            lockEventType
          />
        )}
      </>
    );
  }

  return (
    <div className={cn("flex h-full flex-col lg:flex-row", className)}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <EventCalendar
          events={visibleEvents}
          initialView={initialView}
          onEventAdd={handleEventAdd}
          onEventDelete={handleEventDelete}
          onEventUpdate={handleEventUpdate}
          {...(getMeetLink !== undefined ? { getMeetLink } : {})}
          date={date}
          onDateChange={setDate}
          view={view}
          onViewChange={setView}
          selectedEvent={selectedEvent}
          onSelectedEventChange={(e, triggerEl) => {
            setSelectedEvent(e as CalendarEvent | null);
            if (triggerEl) {
              setQuickViewTriggerRef(triggerEl);
            }
            if (e) {
              setQuickViewOpen(true);
            }
          }}
          onEventCreate={handleEventCreateTrigger}
          timezone={resolvedTimezone}
        />
      </div>

      <div className="hidden lg:flex w-72 min-h-0 flex-col border-l overflow-visible">
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-visible px-8 py-4">
          <div className="space-y-2">
            <BrandButton
              family="rounded"
              className="w-full justify-center"
              variant="secondary"
              size="default"
              onClick={() => setIsEventCreationModalOpen(true)}
            >
              Agendar
            </BrandButton>
          </div>

          <div className="flex justify-center w-full">
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
              onSelect={(date) => {
                if (!date) return;
                setDate(date);
                setView("day");
              }}
              selected={date}
              showOutsideDays={false}
            />
          </div>

          <Separator />

          {/* Dynamic Filters */}
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
            <FiltersBar onFiltersChange={handleFiltersChange} />
          </div>
        </div>
      </div>

      <EventCreationModal
        isOpen={isEventCreationModalOpen}
        onClose={() => {
          setIsEventCreationModalOpen(false);
          setEventCreationInitialValues(null);
        }}
        onSubmit={handleEventCreationSubmit}
        timezone={resolvedTimezone}
        header={{
          showBack: true,
          onBack: () => {
            setIsEventCreationModalOpen(false);
            setEventCreationInitialValues(null);
          },
        }}
        {...(eventCreationInitialValues !== null
          ? { initialValues: eventCreationInitialValues }
          : {})}
        {...(patients ? { patients } : {})}
        {...(locations ? { locations } : {})}
        {...(services ? { services } : {})}
        {...(isLoadingPatients !== undefined ? { isLoadingPatients } : {})}
        {...(isLoadingLocations !== undefined ? { isLoadingLocations } : {})}
        {...(isLoadingServices !== undefined ? { isLoadingServices } : {})}
        {...(hasGoogleMeetAccess !== undefined ? { hasGoogleMeetAccess } : {})}
      />

      {/* Quick View Popover */}
      {selectedEvent && quickViewTriggerRef && (
        <EventQuickViewPopover
          event={selectedEvent as CalendarEventFull}
          triggerRef={{ current: quickViewTriggerRef }}
          open={quickViewOpen}
          onOpenChange={setQuickViewOpen}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEventTrigger}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteEventConfirmationDialog
        event={eventToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        seriesEventCount={1}
      />

      {/* Series Edit Scope Dialog */}
      {editingEvent && (
        <SeriesEditScopeDialog
          open={seriesScopeDialogOpen}
          onOpenChange={setSeriesScopeDialogOpen}
          eventDate={new Date(editingEvent.start)}
          totalEventCount={1}
          onConfirm={handleSeriesScopeConfirm}
          isSaving={isSavingEdit}
        />
      )}

      {/* Edit Modal - Uses same EventCreationModal in edit mode */}
      {isEditModalOpen && editingEvent && (
        <EventCreationModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingEvent(null);
          }}
          onSubmit={handleEditSubmit}
          timezone={resolvedTimezone}
          header={{
            showBack: true,
            onBack: () => {
              setIsEditModalOpen(false);
              setEditingEvent(null);
            },
          }}
          initialValues={{
            ...getEditEventInitialValues(editingEvent, locations),
            ...(getEditInitialValues ? getEditInitialValues(editingEvent) : {}),
          }}
          {...(patients ? { patients } : {})}
          {...(locations ? { locations } : {})}
          {...(services ? { services } : {})}
          {...(isLoadingPatients !== undefined ? { isLoadingPatients } : {})}
          {...(isLoadingLocations !== undefined ? { isLoadingLocations } : {})}
          {...(isLoadingServices !== undefined ? { isLoadingServices } : {})}
          {...(hasGoogleMeetAccess !== undefined ? { hasGoogleMeetAccess } : {})}
          lockEventType
        />
      )}
    </div>
  );
}
