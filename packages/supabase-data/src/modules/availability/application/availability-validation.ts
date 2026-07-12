import {
  AppError,
  AppErrorCode,
  type AppError as AppErrorType,
} from "../../../lib/errors/app-error";
import type {
  SaveWeeklyAvailabilityConfigInput,
  TimeInterval,
  UpdateExceptionInput,
  CreateExceptionInput,
} from "../../../utils/validation-schemas";

function getDayName(dayOfWeek: number): string {
  const days = ["Domingo", "Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"];
  return days[dayOfWeek] ?? "Desconhecido";
}

function validateTimeRange(startTime: string, endTime: string): boolean {
  return startTime < endTime;
}

function validateNoOverlaps(intervals: readonly TimeInterval[]): {
  valid: boolean;
  error?: string;
} {
  if (intervals.length <= 1) {
    return { valid: true };
  }

  const sorted = [...intervals].sort((a, b) => a.startTime.localeCompare(b.startTime));

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const current = sorted[index];
    const next = sorted[index + 1];

    if (!current || !next) {
      continue;
    }

    if (current.endTime > next.startTime) {
      return {
        valid: false,
        error: `Horarios sobrepostos: ${current.startTime}-${current.endTime} vs ${next.startTime}-${next.endTime}`,
      };
    }
  }

  return { valid: true };
}

export function validateWeeklyAvailabilityInput(
  input: SaveWeeklyAvailabilityConfigInput,
): AppErrorType | null {
  for (const dayConfig of input.weeklyDays) {
    if (!dayConfig.isActive) {
      continue;
    }

    for (const interval of dayConfig.intervals) {
      if (!validateTimeRange(interval.startTime, interval.endTime)) {
        return AppError.validation(
          AppErrorCode.VALIDATION_INVALID_FORMAT,
          `${getDayName(dayConfig.dayOfWeek)}: horario final deve ser apos o horario inicial`,
        );
      }
    }

    const overlapCheck = validateNoOverlaps(dayConfig.intervals);
    if (!overlapCheck.valid) {
      return AppError.validation(
        AppErrorCode.VALIDATION_CONSTRAINT_VIOLATION,
        `${getDayName(dayConfig.dayOfWeek)}: ${overlapCheck.error}`,
      );
    }
  }

  return null;
}

export function validateAvailabilityExceptionTimes(
  input: CreateExceptionInput | UpdateExceptionInput,
): AppErrorType | null {
  if (input.startTime && input.endTime && !validateTimeRange(input.startTime, input.endTime)) {
    return AppError.validation(
      AppErrorCode.VALIDATION_INVALID_FORMAT,
      "Horario invalido: termino deve ser apos inicio",
    );
  }

  return null;
}
