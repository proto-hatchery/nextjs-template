import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  AvailabilityExceptionDTO,
  WeeklyAvailabilityConfigDTO,
} from "../../domain/dto/availability.dto";
import type { SaveWeeklyAvailabilityConfigInput } from "../../../../utils/validation-schemas";

type WeeklyScheduleRow = Pick<
  Database["public"]["Tables"]["psychologist_weekly_schedules"]["Row"],
  | "id"
  | "day_of_week"
  | "start_time"
  | "end_time"
  | "is_active"
  | "delivery_mode"
  | "location_id"
  | "daily_appointment_limit"
>;

type AvailabilityExceptionRow = Database["public"]["Tables"]["availability_exceptions"]["Row"];

export function toWeeklyAvailabilityConfig(
  rows: readonly WeeklyScheduleRow[],
): WeeklyAvailabilityConfigDTO {
  const weeklyConfig: WeeklyAvailabilityConfigDTO = {
    0: { dayOfWeek: 0, isActive: false, intervals: [] },
    1: { dayOfWeek: 1, isActive: false, intervals: [] },
    2: { dayOfWeek: 2, isActive: false, intervals: [] },
    3: { dayOfWeek: 3, isActive: false, intervals: [] },
    4: { dayOfWeek: 4, isActive: false, intervals: [] },
    5: { dayOfWeek: 5, isActive: false, intervals: [] },
    6: { dayOfWeek: 6, isActive: false, intervals: [] },
  };

  for (const row of rows) {
    const dayConfig = weeklyConfig[row.day_of_week];
    if (!dayConfig || !row.is_active) {
      continue;
    }

    weeklyConfig[row.day_of_week] = {
      ...dayConfig,
      isActive: true,
      intervals: [
        ...dayConfig.intervals,
        {
          id: row.id,
          startTime: row.start_time.substring(0, 5),
          endTime: row.end_time.substring(0, 5),
          deliveryMode: row.delivery_mode,
          locationId: row.location_id,
          dailyAppointmentLimit: row.daily_appointment_limit,
        },
      ],
    };
  }

  return weeklyConfig;
}

export function toAvailabilityExceptionDTO(
  row: AvailabilityExceptionRow,
): AvailabilityExceptionDTO {
  return {
    id: row.id,
    psychologistId: row.psychologist_id,
    exceptionDate: row.exception_date,
    isAvailable: row.is_available ?? false,
    startTime: row.start_time ?? "",
    endTime: row.end_time ?? "",
    reason: row.reason,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at,
  };
}

export function toWeeklyScheduleInsertRows(
  psychologistId: string,
  input: SaveWeeklyAvailabilityConfigInput,
): Database["public"]["Tables"]["psychologist_weekly_schedules"]["Insert"][] {
  const rows: Database["public"]["Tables"]["psychologist_weekly_schedules"]["Insert"][] = [];

  for (const dayConfig of input.weeklyDays) {
    if (!dayConfig.isActive || dayConfig.intervals.length === 0) {
      continue;
    }

    for (const interval of dayConfig.intervals) {
      rows.push({
        psychologist_id: psychologistId,
        day_of_week: dayConfig.dayOfWeek,
        is_active: true,
        start_time: interval.startTime,
        end_time: interval.endTime,
        delivery_mode: interval.deliveryMode,
        daily_appointment_limit: interval.dailyAppointmentLimit ?? null,
        location_id: interval.locationId ?? null,
      });
    }
  }

  return rows;
}
