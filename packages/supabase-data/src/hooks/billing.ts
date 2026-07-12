"use client";

import { useInfiniteQuery, useQuery, type UseQueryResult } from "@tanstack/react-query";
import { createBrowserAuthClient } from "@workspace/supabase-auth/browser/create-browser-auth-client";
import {
  listCharges,
  listChargesWithPagination,
} from "../modules/charges/application/charge-queries";
import type {
  ChargeFilters,
  ChargeQueryParams,
  ChargeWithDetails,
  ChargeWithRelations,
} from "../types/entities";
import { queryKeys } from "../utils/query-keys";

async function getClientUserId(): Promise<string | null> {
  const supabase = createBrowserAuthClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user?.id ?? null;
}

export function useCharges(filters?: ChargeFilters): UseQueryResult<ChargeWithDetails[], Error> {
  const supabase = createBrowserAuthClient();

  return useQuery({
    queryKey: queryKeys.financial.charges(filters),
    queryFn: async () => {
      const userId = await getClientUserId();
      if (!userId) return [];
      return listCharges(supabase, userId, filters);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useChargesWithPagination(
  options: { pageSize?: number; filters?: ChargeFilters; enabled?: boolean } = {},
) {
  const supabase = createBrowserAuthClient();
  const { pageSize = 20, filters, enabled = true } = options;

  const query = useInfiniteQuery({
    queryKey: queryKeys.financial.chargesPaginated(pageSize, filters),
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const userId = await getClientUserId();
      if (!userId) throw new Error("User not authenticated");

      const params: ChargeQueryParams = {
        pageSize,
        ...(pageParam !== undefined ? { cursor: pageParam } : {}),
        ...(filters !== undefined ? { filters } : {}),
      };

      return listChargesWithPagination(supabase, userId, params);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const charges: ChargeWithRelations[] = query.data?.pages.flatMap((page) => page.data ?? []) ?? [];

  return {
    charges,
    hasNextPage: query.hasNextPage ?? false,
    isPending: query.isPending,
    error: query.error,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: () => {
      void query.fetchNextPage();
    },
    refetch: () => {
      void query.refetch();
    },
  };
}
