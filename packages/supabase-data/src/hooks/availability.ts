"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { z } from "zod";

import { getWeeklyAvailabilityConfigAction } from "../actions/availability/get-weekly-availability-config";
import { unwrapActionResult } from "../lib/boundary/unwrap-action";
import type { WeeklyAvailabilityConfigDTO } from "../modules/availability/domain/dto/availability.dto";
import { queryKeys } from "../utils/query-keys";

const WeeklyAvailabilityConfigResponseSchema = z.any();

export type WeeklyAvailabilityConfig = WeeklyAvailabilityConfigDTO;

export function useWeeklyAvailabilityConfig(): UseQueryResult<WeeklyAvailabilityConfig, Error> {
  return useQuery({
    queryKey: queryKeys.availability.weeklyConfig(),
    queryFn: async () => {
      const data = unwrapActionResult(
        await getWeeklyAvailabilityConfigAction({}),
        WeeklyAvailabilityConfigResponseSchema,
      );
      return data as WeeklyAvailabilityConfig;
    },
    staleTime: 5 * 60 * 1000,
  });
}
