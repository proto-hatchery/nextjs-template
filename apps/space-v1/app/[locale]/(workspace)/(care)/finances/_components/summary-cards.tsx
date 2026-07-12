import { numberToCurrency } from "@workspace/forms/utils/formatting";
import type { FinancialSummary } from "@workspace/supabase-data/types/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { ArrowDownCircle, ArrowUpCircle, Clock3 } from "lucide-react";
import { Wallet } from "lucide-react";

interface FinanceSummaryCardsProps {
  summary?: FinancialSummary;
  isPending?: boolean;
  periodLabel: string;
}

function SummarySkeleton() {
  return (
    <Card className="border border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

export function FinanceSummaryCards({ summary, isPending, periodLabel }: FinanceSummaryCardsProps) {
  if (isPending) {
    return (
      <div className="grid gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummarySkeleton />
        <SummarySkeleton />
        <SummarySkeleton />
        <SummarySkeleton />
      </div>
    );
  }

  // Convert from cents to reais for display
  const netBalance = (summary?.netBalance ?? 0) / 100;
  const income = (summary?.totalIncome ?? 0) / 100;
  const expenses = (summary?.totalExpenses ?? 0) / 100;
  const pending = (summary?.pendingCharges ?? 0) / 100;
  const overdue = (summary?.overdueCharges ?? 0) / 100;
  const topIncomeCategory = summary?.incomeByCategory?.[0];
  const topExpenseCategory = summary?.expensesByCategory?.[0];

  return (
    <div className="grid gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card className="border-none bg-muted/50 shadow-none transition-all hover:bg-muted/70">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Saldo do período
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-semibold leading-tight tracking-tight">
            <span className={"text-foreground"}>{numberToCurrency(netBalance)}</span>
          </div>
          <p className="text-xs text-muted-foreground">{periodLabel}</p>
        </CardContent>
      </Card>

      <Card className="border-none bg-muted/50 shadow-none transition-all hover:bg-muted/70">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Receitas confirmadas
          </CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-semibold leading-tight tracking-tight text-foreground">
            {numberToCurrency(income)}
          </div>
          {topIncomeCategory ? (
            <p className="text-xs text-muted-foreground">
              Maior categoria:{" "}
              <span className="font-medium text-foreground">{topIncomeCategory.categoryName}</span>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Sem receitas categorizadas</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-none bg-muted/50 shadow-none transition-all hover:bg-muted/70">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Despesas confirmadas
          </CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-semibold leading-tight tracking-tight text-foreground">
            {numberToCurrency(expenses)}
          </div>
          {topExpenseCategory ? (
            <p className="text-xs text-muted-foreground">
              Maior categoria:{" "}
              <span className="font-medium text-foreground">{topExpenseCategory.categoryName}</span>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Sem despesas categorizadas</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-none bg-muted/50 shadow-none transition-all hover:bg-muted/70">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Cobranças em aberto
          </CardTitle>
          <Clock3 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-semibold leading-tight tracking-tight text-foreground">
            {numberToCurrency(pending + overdue)}
          </div>
          <p className="text-xs text-muted-foreground">
            {numberToCurrency(pending)} pendentes · {numberToCurrency(overdue)} em atraso
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
