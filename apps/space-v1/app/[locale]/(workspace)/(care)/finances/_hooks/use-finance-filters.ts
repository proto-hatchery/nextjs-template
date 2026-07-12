"use client";

import type { FinancialEntryFilters, FinancialEntryStatus } from "@workspace/supabase-data/types/entities";
import { useMemo, useState } from "react";

interface DateRangeState {
  start?: string;
  end?: string;
}

export function useFinanceFilters() {
  const [{ start, end }, setDateRange] = useState<DateRangeState>({});
  const [type, setType] = useState<"income" | "expense" | undefined>();
  const [status, setStatus] = useState<FinancialEntryStatus | undefined>();
  const [categoryId, setCategoryId] = useState<string | undefined>();

  const filters: FinancialEntryFilters = useMemo(() => {
    return {
      ...(type !== undefined ? { type } : {}),
      ...(categoryId !== undefined ? { categoryId } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(start !== undefined ? { startDate: start } : {}),
      ...(end !== undefined ? { endDate: end } : {}),
    };
  }, [categoryId, end, start, status, type]);

  const updateDateRange = (nextStart?: string, nextEnd?: string) => {
    setDateRange({
      ...(nextStart !== undefined ? { start: nextStart } : {}),
      ...(nextEnd !== undefined ? { end: nextEnd } : {}),
    });
  };

  const clearFilters = () => {
    setType(undefined);
    setStatus(undefined);
    setCategoryId(undefined);
    setDateRange({});
  };

  const hasActiveFilters = useMemo(() => {
    return !!type || !!status || !!categoryId || !!start || !!end;
  }, [categoryId, end, start, status, type]);

  return {
    filters,
    type,
    setType: (value?: "income" | "expense") => {
      setType(value);
    },
    status,
    setStatus: (value?: FinancialEntryStatus) => {
      setStatus(value);
    },
    categoryId,
    setCategoryId: (value?: string) => {
      setCategoryId(value);
    },
    dateRange: { start, end },
    setDateRange: updateDateRange,
    hasActiveFilters,
    clearFilters,
  };
}
