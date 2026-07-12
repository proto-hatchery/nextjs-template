"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { z } from "zod";

import { getPsychologistAction } from "../../actions/psychologists/get-psychologist";
import { getPsychologistLocationsAction } from "../../actions/psychologists/get-psychologist-locations";
import { getPsychologistOnboardingStateAction } from "../../actions/psychologists/get-psychologist-onboarding-state";
import { getPsychologistServicesAction } from "../../actions/psychologists/get-psychologist-services";
import { unwrapActionResult } from "../../lib/boundary/unwrap-action";
import type {
  PsychologistDTO,
  PsychologistLocationDTO,
  PsychologistOnboardingStateDTO,
  PsychologistServiceWithReferenceDTO,
} from "../../modules/psychologists/domain/dto/psychologist.dto";
import { queryKeys } from "../../utils/query-keys";
import { normalizeTimezone } from "../../utils/timezone";

const PsychologistResponseSchema = z.object({
  psychologist: z.any().nullable(),
});

const PsychologistServicesResponseSchema = z.object({
  services: z.array(z.any()),
});

const PsychologistLocationsResponseSchema = z.object({
  locations: z.array(z.any()),
});

const PsychologistOnboardingStateResponseSchema = z.object({
  onboardingState: z.any().nullable(),
});

export function usePsychologist(): UseQueryResult<PsychologistDTO | null, Error> {
  return useQuery({
    queryKey: queryKeys.psychologist.profile(),
    queryFn: async () => {
      const data = unwrapActionResult(await getPsychologistAction({}), PsychologistResponseSchema);
      return data.psychologist as PsychologistDTO | null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePsychologistTimezone(): string {
  const { data: psychologist } = usePsychologist();
  return normalizeTimezone(psychologist?.timezone);
}

export function usePsychologistServices(): UseQueryResult<
  PsychologistServiceWithReferenceDTO[],
  Error
> {
  return useQuery({
    queryKey: queryKeys.psychologist.services(),
    queryFn: async () => {
      const data = unwrapActionResult(
        await getPsychologistServicesAction({}),
        PsychologistServicesResponseSchema,
      );
      return data.services as PsychologistServiceWithReferenceDTO[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePsychologistLocations(): UseQueryResult<PsychologistLocationDTO[], Error> {
  return useQuery({
    queryKey: queryKeys.psychologist.locations(),
    queryFn: async () => {
      const data = unwrapActionResult(
        await getPsychologistLocationsAction({}),
        PsychologistLocationsResponseSchema,
      );
      return data.locations as PsychologistLocationDTO[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePsychologistOnboardingStates(): UseQueryResult<
  PsychologistOnboardingStateDTO | null,
  Error
> {
  return useQuery({
    queryKey: queryKeys.psychologist.onboarding(),
    queryFn: async () => {
      const data = unwrapActionResult(
        await getPsychologistOnboardingStateAction({}),
        PsychologistOnboardingStateResponseSchema,
      );
      return data.onboardingState as PsychologistOnboardingStateDTO | null;
    },
    staleTime: 5 * 60 * 1000,
  });
}
