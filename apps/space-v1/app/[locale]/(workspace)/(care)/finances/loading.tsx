import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { HandCoins, Home } from "lucide-react";

import { PageContentHeader } from "../../_components/page-content-header";
import { PageContentWrapper } from "../../_components/page-content-wrapper";

const SummaryCardSkeleton = () => (
  <div className="border-none bg-muted/50 shadow-none rounded-xl p-6 space-y-2">
    <div className="flex justify-between items-start">
      <Skeleton className="h-4 w-24 bg-muted-foreground/20" />
      <Skeleton className="h-4 w-4 rounded-full bg-muted-foreground/20" />
    </div>
    <div className="space-y-1 pt-2">
      <Skeleton className="h-7 w-32 bg-foreground/20" />
      <Skeleton className="h-3 w-40 bg-muted-foreground/20" />
    </div>
  </div>
);

const TransactionItemSkeleton = () => (
  <div className="flex items-center w-full gap-4 px-1 py-3 group">
    {/* Icon */}
    <Skeleton className="h-11 w-11 rounded-full bg-muted-foreground/10 shrink-0" />

    {/* Middle */}
    <div className="flex flex-1 flex-col gap-1.5 overflow-hidden">
      <Skeleton className="h-4 w-32 bg-foreground/15 rounded-sm" />
      <Skeleton className="h-3 w-20 bg-muted-foreground/15 rounded-sm" />
    </div>

    {/* Right */}
    <div className="flex flex-col items-end gap-1 shrink-0">
      <Skeleton className="h-4 w-24 bg-foreground/15 rounded-sm" />
      <Skeleton className="h-3 w-12 bg-muted-foreground/15 rounded-sm" />
    </div>
  </div>
);

const TransactionDayGroupSkeleton = () => (
  <div className="flex flex-col gap-2">
    {/* Date Header */}
    <Skeleton className="h-3 w-32 bg-muted-foreground/20 mb-2 px-1" />

    {/* Transactions */}
    <div className="flex flex-col">
      <TransactionItemSkeleton />
      <TransactionItemSkeleton />
      <TransactionItemSkeleton />
    </div>
  </div>
);

export default function FinancesLoading() {
  return (
    <PageContentHeader
      breadcrumbs={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/home" className="inline-flex items-center gap-1.5">
                <Home size={16} />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="inline-flex items-center gap-1.5">
                <HandCoins size={16} />
                Finanças
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
      actions={[
        {
          key: "new-transaction-skeleton",
          label: "Nova transação",
          variant: "default",
          disabled: true,
        },
      ]}
    >
      <div className="h-full overflow-y-auto">
        <PageContentWrapper>
          <div className="flex flex-col gap-6 h-full overflow-hidden">
            {/* Summary Cards */}
            <div className="shrink-0 pt-2 grid gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
            </div>

            <div className="flex flex-col flex-1 min-h-0 gap-4">
              <div className="shrink-0 flex flex-col gap-4">
                <h2 className="text-lg font-semibold tracking-tight px-1 text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/50 select-none">
                  Movimentações
                </h2>

                {/* Filters Skeleton */}
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-9 w-24 rounded-md bg-muted/50" />
                  <Skeleton className="h-9 w-20 rounded-md bg-muted/50" />
                  <Skeleton className="h-9 w-20 rounded-md bg-muted/50" />
                  <Skeleton className="h-9 w-28 rounded-md bg-muted/50" />
                </div>
              </div>

              {/* Transaction List Skeleton */}
              <div className="flex-1 min-h-0 pb-12 space-y-8">
                <TransactionDayGroupSkeleton />
                <TransactionDayGroupSkeleton />
              </div>
            </div>
          </div>
        </PageContentWrapper>
      </div>
    </PageContentHeader>
  );
}
