"use client";

import { z } from "zod";
import { isBefore, startOfDay } from "date-fns";
import { isTodayInTimezone, nowInTimezone } from "@workspace/ui/lib/timezone-datetime";
import {
  normalizeOptionalStringValue,
  toRHFEmptyString,
} from "@workspace/forms/v2/kernel/normalization";
import { optionalSelectIdCodec } from "@workspace/forms/v2/schema/codecs";

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

export type EventType = "session" | "supervision" | "other";

export interface EventValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const optionalTextCodec = z.codec(z.string(), z.string().optional(), {
  decode: (value) => normalizeOptionalStringValue(value),
  encode: (value) => toRHFEmptyString(value),
});

const optionalSupervisionTypeCodec = z.codec(
  z.union([z.enum(["giving", "receiving"]), z.literal("")]),
  z.enum(["giving", "receiving"]).optional(),
  {
    decode: (value) => (value === "" ? undefined : value),
    encode: (value) => value ?? "",
  },
);

const recurrenceCodec = z.codec(
  z.union([
    z.enum([
      "FREQ=DAILY",
      "FREQ=WEEKLY",
      "FREQ=MONTHLY",
      "FREQ=YEARLY",
      "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
    ]),
    z.literal(""),
  ]),
  z
    .enum([
      "FREQ=DAILY",
      "FREQ=WEEKLY",
      "FREQ=MONTHLY",
      "FREQ=YEARLY",
      "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
    ])
    .optional(),
  {
    decode: (value) => (value === "" ? undefined : value),
    encode: (value) => value ?? "",
  },
);

const optionalNumberCodec = z.codec(
  z.union([z.string(), z.number(), z.null(), z.undefined()]),
  z.number().finite().optional(),
  {
    decode: (value) => {
      if (value === "" || value === undefined || value === null) {
        return undefined;
      }

      const numeric = typeof value === "number" ? value : Number(value);
      return Number.isNaN(numeric) ? undefined : numeric;
    },
    encode: (value) => (value === undefined ? "" : String(value)),
  },
);

// ----------------------------------------------------------------------
// Base Event Schema
// ----------------------------------------------------------------------

export const baseEventSchema = z.object({
  eventType: z.enum(["session", "supervision", "other"]),
  title: z.string().min(1, "O título é obrigatório"),
  date: z.date(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido"),
  allDay: z.boolean().default(false),
  durationMinutes: z.number().min(15, "A duração mínima é de 15 minutos"),
  patientId: optionalSelectIdCodec,
  serviceId: optionalSelectIdCodec,
  locationId: optionalSelectIdCodec,
  price: optionalNumberCodec,
  notes: optionalTextCodec,
  supervisionType: optionalSupervisionTypeCodec,
  supervisorName: optionalTextCodec,
  superviseeName: optionalTextCodec,
  topic: optionalTextCodec,
  category: optionalTextCodec,
  createGoogleMeet: z.boolean(),
  recurrenceRule: recurrenceCodec,
});

export type EventFormData = z.infer<typeof baseEventSchema>;
export type EventCreationFormInput = z.input<typeof baseEventSchema>;
export type EventCreationFormValues = z.output<typeof baseEventSchema>;

// ----------------------------------------------------------------------
// Utility Functions
// ----------------------------------------------------------------------

/**
 * Combines a date and time string into a Date object
 */
export function combineDateAndTime(date: Date, time: string): Date {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}

/**
 * Calculates duration in minutes between two time strings
 */
export function calculateDurationMinutes(startTime: string, endTime: string): number {
  const [startHours = 0, startMinutes = 0] = startTime.split(":").map(Number);
  const [endHours = 0, endMinutes = 0] = endTime.split(":").map(Number);
  const startTotal = startHours * 60 + startMinutes;
  const endTotal = endHours * 60 + endMinutes;
  return Math.max(0, endTotal - startTotal);
}

// ----------------------------------------------------------------------
// Validation Functions
// ----------------------------------------------------------------------

/**
 * Validates that end time is after start time
 */
export function validateTimeOrder(startTime: string, endTime: string): boolean {
  const duration = calculateDurationMinutes(startTime, endTime);
  return duration > 0;
}

/**
 * Validates that the event date is not in the past
 * Returns a warning if it is (doesn't block submission)
 */
export function validateDateNotInPast(
  date: Date,
  timezone?: string,
): { isValid: boolean; warning?: string } {
  const today = startOfDay(nowInTimezone(timezone));
  const eventDate = startOfDay(date);

  if (isBefore(eventDate, today)) {
    return {
      isValid: true, // Still valid, just a warning
      warning: "A data selecionada está no passado",
    };
  }

  return { isValid: true };
}

/**
 * Validates session-specific requirements
 */
export function validateSessionEvent(data: EventFormData): string[] {
  const errors: string[] = [];

  if (data.eventType === "session") {
    if (!data.patientId) {
      errors.push("Paciente é obrigatório para sessões");
    }
  }

  return errors;
}

/**
 * Validates supervision-specific requirements
 */
export function validateSupervisionEvent(data: EventFormData): string[] {
  const errors: string[] = [];

  if (data.eventType === "supervision") {
    if (!data.supervisionType) {
      errors.push("Tipo de supervisão é obrigatório");
    }

    if (data.supervisionType === "giving" && !data.superviseeName) {
      errors.push("Nome do supervisionado é obrigatório");
    }

    if (data.supervisionType === "receiving" && !data.supervisorName) {
      errors.push("Nome do supervisor é obrigatório");
    }
  }

  return errors;
}

/**
 * Full validation for event form data
 */
export function validateEventForm(data: EventFormData, timezone?: string): EventValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation with Zod
  const zodResult = baseEventSchema.safeParse(data);
  if (!zodResult.success) {
    zodResult.error.issues.forEach((issue) => {
      errors.push(issue.message);
    });
  }

  // Validate time order
  if (!validateTimeOrder(data.startTime, data.endTime)) {
    errors.push("O horário de término deve ser posterior ao horário de início");
  }

  // Validate date not in past (warning only)
  const dateValidation = validateDateNotInPastWithTimezone(data.date, timezone);
  if (dateValidation.warning) {
    warnings.push(dateValidation.warning);
  }

  // Type-specific validations
  errors.push(...validateSessionEvent(data));
  errors.push(...validateSupervisionEvent(data));

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateDateNotInPastWithTimezone(
  date: Date,
  timezone?: string,
): { isValid: boolean; warning?: string } {
  if (isTodayInTimezone(date, timezone)) {
    return { isValid: true };
  }

  const today = startOfDay(nowInTimezone(timezone));
  const eventDate = startOfDay(date);

  if (isBefore(eventDate, today)) {
    return {
      isValid: true,
      warning: "A data selecionada está no passado",
    };
  }

  return { isValid: true };
}

/**
 * Zod schema with refinements for full validation
 */
export const eventFormSchema = baseEventSchema
  .refine((data) => data.allDay || validateTimeOrder(data.startTime, data.endTime), {
    message: "O horário de término deve ser posterior ao horário de início",
    path: ["endTime"],
  })
  .refine(
    (data) => {
      if (data.eventType === "session") {
        return !!data.patientId;
      }
      return true;
    },
    {
      message: "Paciente é obrigatório para sessões",
      path: ["patientId"],
    },
  )
  .refine(
    (data) => {
      if (data.eventType === "supervision") {
        return !!data.supervisionType;
      }
      return true;
    },
    {
      message: "Tipo de supervisão é obrigatório",
      path: ["supervisionType"],
    },
  );

export const eventCreationSchema = eventFormSchema;

// ----------------------------------------------------------------------
// Conflict Detection
// ----------------------------------------------------------------------

export interface CalendarConflict {
  eventId: string;
  eventTitle: string;
  startTime: Date;
  endTime: Date;
}

export interface ConflictCheckResult {
  hasConflicts: boolean;
  conflicts: CalendarConflict[];
}

/**
 * Formats conflicts from the API response to the UI format
 */
export function formatConflicts(
  apiConflicts: Array<{
    eventId: string;
    eventTitle: string;
    startTime: string;
    endTime: string;
  }>,
): CalendarConflict[] {
  return apiConflicts.map((c) => ({
    eventId: c.eventId,
    eventTitle: c.eventTitle,
    startTime: new Date(c.startTime),
    endTime: new Date(c.endTime),
  }));
}

/**
 * Gets a human-readable message for conflicts
 */
export function getConflictMessage(conflicts: CalendarConflict[]): string {
  if (conflicts.length === 0) return "";

  if (conflicts.length === 1) {
    const c = conflicts[0];
    if (!c) return "Existe um evento conflitante neste horário.";
    return `Conflito com "${c.eventTitle}" às ${c.startTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  }

  return `Existem ${conflicts.length} eventos conflitantes neste horário.`;
}

/**
 * Validates event timing and returns conflicts if any
 * This is used for pre-submission validation in the UI
 */
export function validateEventTiming(
  startTime: Date,
  endTime: Date,
  existingEvents: Array<{ id: string; title: string; start: Date; end: Date }>,
  excludeEventId?: string,
): ConflictCheckResult {
  const conflicts: CalendarConflict[] = [];

  for (const event of existingEvents) {
    // Skip the event being edited
    if (excludeEventId && event.id === excludeEventId) continue;

    // Check for overlap: events overlap if one starts before the other ends
    // and ends after the other starts
    const overlaps = startTime < event.end && endTime > event.start;

    if (overlaps) {
      conflicts.push({
        eventId: event.id,
        eventTitle: event.title,
        startTime: event.start,
        endTime: event.end,
      });
    }
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
  };
}
