"use client";

import { numberToCurrency } from "@workspace/forms/utils/formatting";
import type { FinancialSummary } from "@workspace/supabase-data/types/entities";

interface MobileSummaryCardsProps {
  summary?: FinancialSummary;
  isPending?: boolean;
  periodLabel: string;
}

export function MobileSummaryCards({ summary, isPending, periodLabel }: MobileSummaryCardsProps) {
  const netBalance = (summary?.netBalance ?? 0) / 100;
  const income = (summary?.totalIncome ?? 0) / 100;
  const expenses = (summary?.totalExpenses ?? 0) / 100;
  const pending = (summary?.pendingCharges ?? 0) / 100;
  const overdue = (summary?.overdueCharges ?? 0) / 100;

  if (isPending) {
    return (
      <div className="flex flex-col gap-3">
        <div className="h-32 w-full animate-pulse rounded-2xl bg-muted/50" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-20 animate-pulse rounded-2xl bg-muted/50" />
          <div className="h-20 animate-pulse rounded-2xl bg-muted/50" />
          <div className="h-20 animate-pulse rounded-2xl bg-muted/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main Balance Card */}
      <div className="bg-muted/50 rounded-xl p-5">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-muted-foreground uppercase tracking-tight flex items-center gap-1.5">
            Saldo do Período
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black tracking-tighter text-foreground">
              {numberToCurrency(netBalance)}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground mt-1">{periodLabel}</span>
        </div>
      </div>

      {/* Grid of secondary metrics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-muted/50 rounded-xl p-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <span className="text-[11px] font-bold uppercase tracking-tight">Receitas</span>
          </div>
          <span className="text-sm font-black truncate">{numberToCurrency(income)}</span>
        </div>

        <div className="bg-muted/50 rounded-xl p-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <span className="text-[11px] font-bold uppercase tracking-tight">Despesas</span>
          </div>
          <span className="text-sm font-black truncate text-foreground">
            {numberToCurrency(expenses)}
          </span>
        </div>

        <div className="bg-muted/50 rounded-xl p-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <span className="text-[11px] font-bold uppercase tracking-tight">Abertos</span>
          </div>
          <span className="text-sm font-black truncate">{numberToCurrency(pending + overdue)}</span>
        </div>
      </div>
    </div>
  );
}
