"use client";

import {
  useInfiniteQuery,
  useQuery,
  type UseInfiniteQueryResult,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  getActivitiesAction,
  type GetActivitiesRequest,
} from "../actions/catalogs/get-activities";
import { getAllCatalogsAction } from "../actions/catalogs/get-all-catalogs";
import { getApproachesAction } from "../actions/catalogs/get-approaches";
import { getCancellationPoliciesAction } from "../actions/catalogs/get-cancellation-policies";
import { getServicesAction } from "../actions/catalogs/get-services";
import { getSpecialtiesAction } from "../actions/catalogs/get-specialties";
import type {
  ActivityReferenceDTO,
  AllCatalogsDTO,
  ApproachReferenceDTO,
  CancellationPolicyReferenceDTO,
  ServiceReferenceDTO,
  SpecialtyReferenceDTO,
} from "../modules/catalogs/domain/dto/reference-value.dto";
import { queryKeys } from "../utils/query-keys";

const STALE_TIME_MS = 24 * 60 * 60 * 1000;

type ActivitiesPage = {
  readonly activities: readonly ActivityReferenceDTO[];
  readonly hasMore: boolean;
  readonly nextPage: number;
};

function getActivitiesQueryKey(input: GetActivitiesRequest = {}) {
  if (input.page !== undefined || input.pageSize !== undefined) {
    return [
      ...queryKeys.catalogs.activities(),
      "paginated",
      { page: input.page ?? 0, pageSize: input.pageSize ?? 12 },
    ] as const;
  }

  return queryKeys.catalogs.activities();
}

export function useServicesCatalog(): UseQueryResult<readonly ServiceReferenceDTO[], Error> {
  return useQuery({
    queryKey: queryKeys.catalogs.services(),
    queryFn: async () => {
      const result = await getServicesAction({});
      if (!result.success) {
        throw new Error(result.error?.message ?? "Failed to fetch services catalog");
      }
      return result.data.services;
    },
    staleTime: STALE_TIME_MS,
  });
}

export function useSpecialtiesCatalog(): UseQueryResult<readonly SpecialtyReferenceDTO[], Error> {
  return useQuery({
    queryKey: queryKeys.catalogs.specialties(),
    queryFn: async () => {
      const result = await getSpecialtiesAction({});
      if (!result.success) {
        throw new Error(result.error?.message ?? "Failed to fetch specialties catalog");
      }
      return result.data.specialties;
    },
    staleTime: STALE_TIME_MS,
  });
}

export function useApproachesCatalog(): UseQueryResult<readonly ApproachReferenceDTO[], Error> {
  return useQuery({
    queryKey: queryKeys.catalogs.approaches(),
    queryFn: async () => {
      const result = await getApproachesAction({});
      if (!result.success) {
        throw new Error(result.error?.message ?? "Failed to fetch approaches catalog");
      }
      return result.data.approaches;
    },
    staleTime: STALE_TIME_MS,
  });
}

export function useCancellationPoliciesCatalog(): UseQueryResult<
  readonly CancellationPolicyReferenceDTO[],
  Error
> {
  return useQuery({
    queryKey: queryKeys.catalogs.cancellationPolicies(),
    queryFn: async () => {
      const result = await getCancellationPoliciesAction({});
      if (!result.success) {
        throw new Error(result.error?.message ?? "Failed to fetch cancellation policies catalog");
      }
      return result.data.cancellationPolicies;
    },
    staleTime: STALE_TIME_MS,
  });
}

export function useAllCatalogs(): UseQueryResult<AllCatalogsDTO, Error> {
  return useQuery({
    queryKey: queryKeys.catalogs.full(),
    queryFn: async () => {
      const result = await getAllCatalogsAction({});
      if (!result.success) {
        throw new Error(result.error?.message ?? "Failed to fetch all catalogs");
      }
      return result.data;
    },
    staleTime: STALE_TIME_MS,
  });
}

export function useActivities(): UseQueryResult<readonly ActivityReferenceDTO[], Error> {
  return useQuery({
    queryKey: getActivitiesQueryKey(),
    queryFn: async () => {
      const result = await getActivitiesAction({});
      if (!result.success) {
        throw new Error(result.error?.message ?? "Failed to fetch activities catalog");
      }
      return result.data.activities;
    },
    staleTime: STALE_TIME_MS,
  });
}

export function useActivitiesInfinite(
  pageSize: number = 12,
): UseInfiniteQueryResult<ActivitiesPage, Error> {
  return useInfiniteQuery({
    queryKey: [...getActivitiesQueryKey(), "infinite", pageSize],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === "number" ? pageParam : 0;
      const result = await getActivitiesAction({ page, pageSize });
      if (!result.success) {
        throw new Error(result.error?.message ?? "Failed to fetch paginated activities catalog");
      }

      const activities = result.data.activities;
      return {
        activities,
        hasMore: activities.length === pageSize,
        nextPage: page + 1,
      };
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextPage : undefined),
    staleTime: STALE_TIME_MS,
  });
}
