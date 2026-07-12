export interface WeeklyAvailabilityIntervalDTO {
  id: string;
  startTime: string;
  endTime: string;
  deliveryMode: "in_person" | "telehealth" | "hybrid";
  locationId?: string | null;
  dailyAppointmentLimit?: number | null;
}

export interface WeeklyDayConfigDTO {
  dayOfWeek: number;
  isActive: boolean;
  intervals: WeeklyAvailabilityIntervalDTO[];
}

export type WeeklyAvailabilityConfigDTO = Record<number, WeeklyDayConfigDTO>;

export interface AvailabilityExceptionDTO {
  id: string;
  psychologistId: string;
  exceptionDate: string;
  isAvailable: boolean;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
  createdAt: string;
  updatedAt: string | null;
}
