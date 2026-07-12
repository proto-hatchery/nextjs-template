import type {
  WeeklyAvailabilityIntervalDTO,
  WeeklyDayConfigDTO,
} from "@workspace/supabase-data/modules/availability/domain/dto/availability.dto";

export type WeeklyAvailabilityInterval = WeeklyAvailabilityIntervalDTO;
export type WeeklyDayConfig = WeeklyDayConfigDTO;

export const ONLINE_LOCATION_SENTINEL = "__online__";

export type AvailabilityLocationOption = { id: string; name: string };

export function requiresPhysicalLocation(deliveryMode: string): boolean {
  return deliveryMode === "in_person" || deliveryMode === "hybrid";
}

export function getDefaultDeliveryMode(locationId?: string | null) {
  return locationId ? "hybrid" : "telehealth";
}

export function getLocationSelectValue(interval: {
  locationId?: string | null;
  deliveryMode: string;
}): string {
  if (!interval.locationId && interval.deliveryMode === "telehealth") {
    return ONLINE_LOCATION_SENTINEL;
  }

  return interval.locationId ?? "";
}

export function normalizeAvailabilityIntervalForLocations(
  interval: WeeklyAvailabilityInterval,
  defaultLocationId?: string | null,
): WeeklyAvailabilityInterval {
  if ((interval.deliveryMode as string) === "telehealth") {
    return { ...interval, locationId: null, deliveryMode: "telehealth" as const };
  }

  if (interval.locationId) {
    return interval;
  }

  if (defaultLocationId && requiresPhysicalLocation(interval.deliveryMode)) {
    return { ...interval, locationId: defaultLocationId };
  }

  return { ...interval, locationId: null, deliveryMode: "telehealth" as const };
}

export function normalizeAvailabilityIntervalsForLocations(
  intervals: WeeklyAvailabilityInterval[],
  defaultLocationId?: string | null,
): WeeklyAvailabilityInterval[] {
  return intervals.map((interval) =>
    normalizeAvailabilityIntervalForLocations(interval, defaultLocationId),
  );
}

export function normalizeWeeklyAvailabilityForLocations(
  config: Record<number, WeeklyDayConfig>,
  defaultLocationId?: string | null,
): Record<number, WeeklyDayConfig> {
  return Object.fromEntries(
    Object.entries(config).map(([day, dayConfig]) => [
      Number(day),
      {
        ...dayConfig,
        intervals: normalizeAvailabilityIntervalsForLocations(
          dayConfig.intervals,
          defaultLocationId,
        ),
      },
    ]),
  );
}
