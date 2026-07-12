export type CalendarView = "month" | "week" | "day" | "agenda";

export type EventColor = "sky" | "amber" | "violet" | "rose" | "emerald" | "orange" | "indigo";

export type CalendarSource = {
  id: string;
  label: string;
  color?: EventColor;
  description?: string;
};

/**
 * Base calendar event structure.
 * All calendar events (sessions, blocks, birthdays, holidays, etc.) must conform to this interface.
 */
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: EventColor;
  location?: string;
  type?: "event" | "appointment";
  /**
   * Calendar source identifier.
   * Maps to CALENDAR_SOURCES in app domain constants.
   * Examples: "sessions" | "supervision" | "meetings" | "blocks" | "other" | "birthdays" | "holidays"
   * Optional for backward compatibility with existing code.
   */
  calendarId?: string;
  /**
   * Controls whether the event can be edited via drag/resize.
   * Defaults to true if not specified.
   */
  editable?: boolean;
  /**
   * Controls whether the event can be deleted.
   * Defaults to true if not specified.
   */
  deletable?: boolean;
}
