"use client";

import type { ClinicalSessionStatus, PaymentStatus } from "@workspace/supabase-data/types/entities";
import { useMemo, useState } from "react";

export function useUpcomingSessionsFilters() {
  const [sessionStatus, setSessionStatus] = useState<ClinicalSessionStatus | undefined>();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  const hasActiveFilters = useMemo(() => {
    return !!sessionStatus || !!paymentStatus || !!searchQuery.trim();
  }, [sessionStatus, paymentStatus, searchQuery]);

  const clearFilters = () => {
    setSessionStatus(undefined);
    setPaymentStatus(undefined);
    setSearchQuery("");
  };

  return {
    sessionStatus,
    setSessionStatus,
    paymentStatus,
    setPaymentStatus,
    searchQuery,
    setSearchQuery,
    hasActiveFilters,
    clearFilters,
  };
}
