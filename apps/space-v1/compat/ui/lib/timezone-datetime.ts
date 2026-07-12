import { DateTime } from "luxon";

export const DEFAULT_USER_TIMEZONE = "America/Sao_Paulo";

export function isValidIanaTimezone(timezone: string): boolean {
  if (!timezone || timezone.trim().length === 0) {
    return false;
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone.trim() });
    return true;
  } catch {
    return false;
  }
}

export function normalizeTimezone(timezone?: string | null): string {
  if (!timezone) {
    return DEFAULT_USER_TIMEZONE;
  }

  const trimmed = timezone.trim();
  return isValidIanaTimezone(trimmed) ? trimmed : DEFAULT_USER_TIMEZONE;
}

function assertSameWallClock(
  dateTime: DateTime,
  expected: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    millisecond: number;
  },
  timezone: string,
) {
  if (
    dateTime.year !== expected.year ||
    dateTime.month !== expected.month ||
    dateTime.day !== expected.day ||
    dateTime.hour !== expected.hour ||
    dateTime.minute !== expected.minute ||
    dateTime.second !== expected.second ||
    dateTime.millisecond !== expected.millisecond
  ) {
    throw new Error(`Invalid local time for ${timezone}: local clock time does not exist`);
  }
}

export function utcIsoToWallClockDate(utcIso: string, timezone?: string): Date {
  const resolvedTimezone = normalizeTimezone(timezone);
  const utcDateTime = DateTime.fromISO(utcIso, { setZone: true });

  if (!utcDateTime.isValid) {
    throw new Error(`Invalid UTC datetime: ${utcDateTime.invalidReason ?? "unknown"}`);
  }

  const localDateTime = utcDateTime.setZone(resolvedTimezone);

  if (!localDateTime.isValid) {
    throw new Error(
      `Invalid datetime for ${resolvedTimezone}: ${localDateTime.invalidReason ?? "unknown"}`,
    );
  }

  // Create a wall-clock Date object for UI math/formatting in user timezone.
  return new Date(
    localDateTime.year,
    localDateTime.month - 1,
    localDateTime.day,
    localDateTime.hour,
    localDateTime.minute,
    localDateTime.second,
    localDateTime.millisecond,
  );
}

export function wallClockDateToUtcIso(date: Date, timezone?: string): string {
  const resolvedTimezone = normalizeTimezone(timezone);
  const expected = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
    millisecond: date.getMilliseconds(),
  };

  const localDateTime = DateTime.fromObject(expected, { zone: resolvedTimezone });

  if (!localDateTime.isValid) {
    throw new Error(
      `Invalid local time for ${resolvedTimezone}: ${localDateTime.invalidReason ?? "unknown"}`,
    );
  }

  assertSameWallClock(localDateTime, expected, resolvedTimezone);

  return localDateTime.toUTC().toISO()!;
}

export function wallClockDateToYmd(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toStartOfWallClockDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function toEndOfWallClockDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function nowInTimezone(timezone?: string, now: Date = new Date()): Date {
  return utcIsoToWallClockDate(now.toISOString(), timezone);
}

export function isTodayInTimezone(
  date: Date,
  timezone?: string,
  options?: { now?: Date },
): boolean {
  const today = nowInTimezone(timezone, options?.now);
  const normalizedDate = toStartOfWallClockDay(date);
  const normalizedToday = toStartOfWallClockDay(today);
  return normalizedDate.getTime() === normalizedToday.getTime();
}

export function getDayBoundsUtcIso(
  date: Date,
  timezone?: string,
): {
  startUtcIso: string;
  endUtcIso: string;
} {
  const startWallClock = toStartOfWallClockDay(date);
  const endWallClock = toEndOfWallClockDay(date);

  return {
    startUtcIso: wallClockDateToUtcIso(startWallClock, timezone),
    endUtcIso: wallClockDateToUtcIso(endWallClock, timezone),
  };
}

export function getTodayBoundsUtcIso(
  timezone?: string,
  options?: { now?: Date },
): {
  startUtcIso: string;
  endUtcIso: string;
} {
  const today = nowInTimezone(timezone, options?.now);
  return getDayBoundsUtcIso(today, timezone);
}

interface RoundedNowInTimezoneOptions {
  now?: Date;
  roundToMinutes?: number;
}

/**
 * Returns a wall-clock date rounded up to the next interval in the provided timezone.
 * This should be used for "next available slot" suggestions to avoid browser timezone drift.
 */
export function getRoundedNowInTimezone(
  timezone?: string,
  options?: RoundedNowInTimezoneOptions,
): Date {
  const resolvedTimezone = normalizeTimezone(timezone);
  const roundToMinutes = options?.roundToMinutes ?? 15;

  if (!Number.isInteger(roundToMinutes) || roundToMinutes <= 0 || roundToMinutes > 24 * 60) {
    throw new Error("roundToMinutes must be an integer between 1 and 1440");
  }

  const referenceNow = options?.now ?? new Date();
  const zonedNow = DateTime.fromJSDate(referenceNow, { zone: "utc" }).setZone(resolvedTimezone);

  if (!zonedNow.isValid) {
    throw new Error(
      `Invalid datetime for ${resolvedTimezone}: ${zonedNow.invalidReason ?? "unknown"}`,
    );
  }

  const totalMinutes = zonedNow.hour * 60 + zonedNow.minute;
  const roundedTotalMinutes = Math.ceil(totalMinutes / roundToMinutes) * roundToMinutes;
  const dayOffset = Math.floor(roundedTotalMinutes / (24 * 60));
  const minutesInDay = roundedTotalMinutes % (24 * 60);

  const roundedDateTime = zonedNow
    .startOf("day")
    .plus({ days: dayOffset, minutes: minutesInDay })
    .set({ millisecond: 0, second: 0 });

  return new Date(
    roundedDateTime.year,
    roundedDateTime.month - 1,
    roundedDateTime.day,
    roundedDateTime.hour,
    roundedDateTime.minute,
    roundedDateTime.second,
    roundedDateTime.millisecond,
  );
}
