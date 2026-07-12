"use client";

import type { ClinicalSessionStatus, PaymentStatus } from "@workspace/supabase-data/types/entities";
import { usePsychologistTimezone } from "@workspace/supabase-data/hooks/psychologists/use-psychologist-queries";
import { Input } from "@workspace/ui/components/input";
import { nowInTimezone } from "@workspace/ui/lib/timezone-datetime";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { CheckboxFilterDropdown } from "@workspace/brand/patterns/filtering/checkbox-filter-dropdown";
import { Search as SearchIcon } from "lucide-react";
import { useMemo } from "react";

import { useUpcomingSessionsFilters } from "../_hooks/use-upcoming-sessions-filters";
import type { UpcomingSession } from "../types/session";
import { UpcomingSessionsTable } from "./upcoming-sessions-table";

interface UpcomingSessionsClientProps {
  sessions: UpcomingSession[];
}

const SESSION_STATUS_OPTIONS = [
  { value: "scheduled", label: "Agendada" },
  { value: "open", label: "Em aberto" },
  { value: "completed", label: "Realizada" },
  { value: "cancelled", label: "Cancelada" },
  { value: "no_show", label: "Não compareceu" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", label: "Pendente" },
  { value: "paid", label: "Pago" },
  { value: "overdue", label: "Atrasado" },
  { value: "refunded", label: "Reembolsado" },
  { value: "cancelled", label: "Cancelado" },
];

export function UpcomingSessionsClient({ sessions }: UpcomingSessionsClientProps) {
  const userTimezone = usePsychologistTimezone();
  const {
    sessionStatus,
    setSessionStatus,
    paymentStatus,
    setPaymentStatus,
    searchQuery,
    setSearchQuery,
    hasActiveFilters,
    clearFilters,
  } = useUpcomingSessionsFilters();

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      // Filter by search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        if (!session.clientName.toLowerCase().includes(q)) {
          return false;
        }
      }

      // Filter by session status
      if (sessionStatus && session.status !== sessionStatus) {
        return false;
      }

      // Filter by payment status
      if (paymentStatus) {
        if (session.paymentStatus !== paymentStatus) {
          return false;
        }
      }

      return true;
    });
  }, [sessions, searchQuery, sessionStatus, paymentStatus]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-medium text-foreground">Próximas sessões</h2>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <CheckboxFilterDropdown
            label="Status"
            options={SESSION_STATUS_OPTIONS}
            selectedValues={sessionStatus ? [sessionStatus] : []}
            onSelectionChange={(values: string[]) => {
              const nextStatus = values[0];
              setSessionStatus(nextStatus as ClinicalSessionStatus | undefined);
            }}
            onClear={() => setSessionStatus(undefined)}
          />
          <CheckboxFilterDropdown
            label="Pagamento"
            options={PAYMENT_STATUS_OPTIONS}
            selectedValues={paymentStatus ? [paymentStatus] : []}
            onSelectionChange={(values: string[]) => {
              const nextStatus = values[0];
              setPaymentStatus(nextStatus as PaymentStatus | undefined);
            }}
            onClear={() => setPaymentStatus(undefined)}
          />
          {hasActiveFilters && (
            <BrandButton variant="ghost" size="sm" onClick={clearFilters}>
              Limpar filtros
            </BrandButton>
          )}
        </div>

        <div className="w-full sm:w-64 p-1">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente"
              aria-label="Buscar paciente"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-9 bg-background"
            />
          </div>
        </div>
      </div>

      <UpcomingSessionsTable
        sessions={filteredSessions}
        now={nowInTimezone(userTimezone)}
        timezone={userTimezone}
      />
    </div>
  );
}
