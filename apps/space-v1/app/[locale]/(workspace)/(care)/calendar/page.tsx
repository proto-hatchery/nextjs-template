"use client";

import { CalendarPageLayout } from "@/app/[locale]/(workspace)/(care)/calendar/_feature/ui/event-calendar/calendar-page";

import { CalendarPageSkeleton } from "./_components/calendar-page-skeleton";
import { useCalendarPageController } from "./_hooks/use-calendar-page-controller";

export default function CalendarPage() {
  const controller = useCalendarPageController();

  if (controller.isPending) {
    return <CalendarPageSkeleton />;
  }

  return (
    <CalendarPageLayout
      className="h-full"
      timezone={controller.timezone}
      calendars={controller.calendars}
      initialEvents={controller.initialEvents}
      initialView="month"
      onEventAdd={controller.onEventAdd}
      onEventUpdate={controller.onEventUpdate}
      onEventConvertToSeries={controller.onEventConvertToSeries}
      getEditInitialValues={controller.getEditInitialValues}
      onEventDelete={controller.onEventDelete}
      onSeriesUpdate={controller.onSeriesUpdate}
      onSeriesDelete={controller.onSeriesDelete}
      onEventsChange={controller.onEventsChange}
      getMeetLink={controller.getMeetLink}
      onEventCreate={controller.onEventCreate}
      eventCreationOptions={controller.eventCreationOptions}
    />
  );
}
