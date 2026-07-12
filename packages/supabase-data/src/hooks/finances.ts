"use client";

import { useInfiniteQuery, useQuery, type UseQueryResult } from "@tanstack/react-query";
import { createBrowserAuthClient } from "@workspace/supabase-auth/browser/create-browser-auth-client";
import {
  getFinancialSummary,
  listFinancialEntries,
  listRecentFinancialEntries,
  listTransactionCategories,
} from "../modules/finances/application/financial-entry-queries";
import type {
  FinancialEntryFilters,
  FinancialEntryWithDetails,
  FinancialPeriod,
  FinancialSummary,
} from "../types/entities";
import { queryKeys } from "../utils/query-keys";

interface FinancialEntriesInfiniteOptions {
  pageSize?: number;
  filters?: Omit<FinancialEntryFilters, "limit" | "offset">;
  enabled?: boolean;
}

interface FinancialEntriesPage {
  data: FinancialEntryWithDetails[];
  hasMore: boolean;
  nextOffset: number;
}

async function getClientUserId(): Promise<string | null> {
  const supabase = createBrowserAuthClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user?.id ?? null;
}

export function useFinancialEntries(
  filters?: FinancialEntryFilters,
): UseQueryResult<FinancialEntryWithDetails[], Error> {
  const supabase = createBrowserAuthClient();

  return useQuery({
    queryKey: queryKeys.financial.entries(filters),
    queryFn: async () => {
      const userId = await getClientUserId();
      if (!userId) return [];
      return listFinancialEntries(supabase, userId, filters);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFinancialEntriesWithPagination(options: FinancialEntriesInfiniteOptions = {}) {
  const supabase = createBrowserAuthClient();
  const { pageSize = 20, filters, enabled = true } = options;

  const query = useInfiniteQuery({
    queryKey: [...queryKeys.financial.entries(filters), "paginated", pageSize] as const,
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const userId = await getClientUserId();
      if (!userId) return { data: [], hasMore: false, nextOffset: pageParam };

      const result = await listFinancialEntries(supabase, userId, {
        ...filters,
        limit: pageSize,
        offset: pageParam,
      });

      return {
        data: result,
        hasMore: result.length === pageSize,
        nextOffset: pageParam + pageSize,
      } satisfies FinancialEntriesPage;
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextOffset : undefined),
    initialPageParam: 0,
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const entries = query.data?.pages.flatMap((page) => page.data ?? []) ?? [];

  return {
    entries,
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

export function useTransactionCategories(): UseQueryResult<
  { id: string; name: string; type: string; is_selectable: boolean }[],
  Error
> {
  const supabase = createBrowserAuthClient();

  return useQuery({
    queryKey: queryKeys.financial.categories(),
    queryFn: () => listTransactionCategories(supabase),
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useFinancialSummary(
  period: FinancialPeriod,
): UseQueryResult<FinancialSummary, Error> {
  const supabase = createBrowserAuthClient();

  return useQuery({
    queryKey: queryKeys.financial.summary(period),
    queryFn: async () => {
      const userId = await getClientUserId();
      if (!userId) throw new Error("Not authenticated");
      return getFinancialSummary(supabase, userId, period);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecentTransactions(
  limit = 10,
): UseQueryResult<FinancialEntryWithDetails[], Error> {
  const supabase = createBrowserAuthClient();

  return useQuery({
    queryKey: queryKeys.financial.recent(limit),
    queryFn: async () => {
      const userId = await getClientUserId();
      if (!userId) return [];
      return listRecentFinancialEntries(supabase, userId, limit);
    },
    staleTime: 5 * 60 * 1000,
  });
}
