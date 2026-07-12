"use client";

import type { FinancialEntryWithDetails } from "@workspace/supabase-data/types/entities";
import { deleteFinancialEntryAction } from "@workspace/supabase-data/actions/financial/delete-financial-entry";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import {
  useFinancialEntriesWithPagination,
  useFinancialSummary,
  useTransactionCategories,
} from "@workspace/supabase-data/hooks/finances";
import { queryKeys } from "@workspace/supabase-data/utils/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { CheckboxFilterDropdown } from "@workspace/brand/patterns/filtering/checkbox-filter-dropdown";
import { DateRangeFilterDropdown } from "@workspace/brand/patterns/filtering/date-range-filter-dropdown";
import { FilterHeaderLayout } from "@workspace/brand/patterns/filtering/filter-header-layout";
import { endOfDay, format, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { HandCoins, Home, Plus } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

import { PageContentHeader } from "../../../_components/page-content-header";
import { PageContentWrapper } from "../../../_components/page-content-wrapper";
import { useFinanceFilters } from "../_hooks/use-finance-filters";
import { useTransactionDialog } from "../_hooks/use-transaction-dialog";
import { CONSOLIDATED_ENTRY_MESSAGE, isConsolidatedEntry } from "../_utils/consolidation";
import { FinancesMobile } from "./finances-mobile";
import { FinanceSummaryCards } from "./summary-cards";
import { TransactionDayGroup } from "./transaction-day-group";
import { TransactionModal } from "./transaction-modal";

const STATUS_OPTIONS = [
  { value: "confirmed", label: "Confirmada" },
  { value: "pending", label: "Pendente" },
  { value: "cancelled", label: "Cancelada" },
];

const TYPE_OPTIONS = [
  { value: "income", label: "Receita" },
  { value: "expense", label: "Despesa" },
];

export function FinancesPage() {
  const isMobile = useIsMobile();
  const {
    filters,
    type,
    setType,
    status,
    setStatus,
    categoryId,
    setCategoryId,
    dateRange,
    setDateRange,
    hasActiveFilters,
    clearFilters,
  } = useFinanceFilters();

  const dialog = useTransactionDialog();
  const queryClient = useQueryClient();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const summaryPeriod = useMemo(
    () =>
      filters.startDate && filters.endDate
        ? {
            startDate: filters.startDate,
            endDate: filters.endDate,
          }
        : {
            startDate: "1970-01-01T00:00:00.000Z",
            endDate: endOfDay(new Date()).toISOString(),
          },
    [filters.endDate, filters.startDate],
  );

  const { data: categoriesData } = useTransactionCategories();
  const {
    entries,
    hasNextPage,
    isPending: loadingEntries,
    error: entriesError,
    isFetchingNextPage,
    fetchNextPage,
  } = useFinancialEntriesWithPagination({
    pageSize: 20,
    filters,
    enabled: true,
  });
  const { data: summary, isPending: loadingSummary } = useFinancialSummary(summaryPeriod);

  const handleDelete = async (entry: FinancialEntryWithDetails) => {
    if (isConsolidatedEntry(entry)) {
      toast.info("Entrada sincronizada", {
        description: CONSOLIDATED_ENTRY_MESSAGE,
      });
      return;
    }
    try {
      unwrapActionResult(await deleteFinancialEntryAction({ entryId: entry.id }));
      await queryClient.invalidateQueries({ queryKey: queryKeys.financial.all });
      toast.success("Transação removida");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao excluir transação";
      toast.error(message);
    }
  };

  const handleEdit = (entry: FinancialEntryWithDetails) => {
    if (isConsolidatedEntry(entry)) {
      toast.info("Entrada sincronizada", {
        description: CONSOLIDATED_ENTRY_MESSAGE,
      });
      return;
    }
    dialog.openEdit(entry);
  };

  const periodLabel =
    dateRange.start && dateRange.end
      ? format(new Date(dateRange.start), "dd MMM", { locale: ptBR })
          .concat(" - ")
          .concat(format(new Date(dateRange.end), "dd MMM yyyy", { locale: ptBR }))
      : "Todo período";

  const categoryOptions =
    categoriesData?.map((cat) => ({
      value: cat.id,
      label: cat.name,
      type: cat.type,
    })) ?? [];

  // Group entries by day for the new desktop list view
  const entriesByDay = useMemo(() => {
    if (entries.length === 0) return new Map<string, FinancialEntryWithDetails[]>();

    const entriesMap = new Map<string, FinancialEntryWithDetails[]>();

    entries.forEach((entry) => {
      const entryDate = entry.date_time
        ? startOfDay(new Date(entry.date_time))
        : startOfDay(new Date());
      const dateKey = entryDate.toISOString();

      if (!entriesMap.has(dateKey)) {
        entriesMap.set(dateKey, []);
      }
      entriesMap.get(dateKey)?.push(entry);
    });

    return entriesMap;
  }, [entries]);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (intersectionEntries) => {
        const firstEntry = intersectionEntries[0];
        if (firstEntry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: "240px", threshold: 0.1 },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isMobile) {
    return (
      <>
        <PageContentHeader
          breadcrumbs={
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/home">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Finanças</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
        >
          <FinancesMobile
            {...(summary !== undefined ? { summary } : {})}
            loadingSummary={loadingSummary}
            entries={entries}
            loadingEntries={loadingEntries}
            periodLabel={periodLabel}
            sentinelRef={sentinelRef}
            isFetchingNextPage={isFetchingNextPage}
            onEdit={handleEdit}
            onAdd={() => dialog.openCreate(type ?? "income")}
          />
        </PageContentHeader>

        <TransactionModal
          open={dialog.open}
          onOpenChange={(open) => {
            dialog.setOpen(open);
            if (!open) dialog.close();
          }}
          mode={dialog.mode}
          defaultType={dialog.defaultType}
          entry={dialog.entry}
        />
      </>
    );
  }

  return (
    <>
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
            key: "new-transaction",
            label: "Nova transação",
            variant: "default",
            onClick: () => dialog.openCreate("income"),
          },
        ]}
      >
        <div className="h-full overflow-y-auto">
          <PageContentWrapper>
            <div className="flex flex-col gap-6 h-full overflow-hidden">
              <div className="shrink-0 pt-2">
                <FinanceSummaryCards
                  {...(summary !== undefined ? { summary } : {})}
                  isPending={loadingSummary}
                  periodLabel={periodLabel}
                />
              </div>

              <div className="flex flex-col flex-1 min-h-0 gap-4">
                <div className="shrink-0 flex flex-col gap-4">
                  <h2 className="text-lg font-semibold tracking-tight px-1">Movimentações</h2>
                  <FilterHeaderLayout
                    filterSection={
                      <div className="flex flex-wrap gap-2">
                        <DateRangeFilterDropdown
                          {...(dateRange.start !== undefined ? { startDate: dateRange.start } : {})}
                          {...(dateRange.end !== undefined ? { endDate: dateRange.end } : {})}
                          onDateRangeChange={(start, end) => setDateRange(start, end)}
                          onClear={() => setDateRange(undefined, undefined)}
                          label="Período"
                        />
                        <CheckboxFilterDropdown
                          label="Tipo"
                          options={TYPE_OPTIONS}
                          selectedValues={type ? [type] : []}
                          onSelectionChange={(values) =>
                            setType((values[0] as typeof type) ?? undefined)
                          }
                          onClear={() => setType(undefined)}
                        />
                        <CheckboxFilterDropdown
                          label="Status"
                          options={STATUS_OPTIONS}
                          selectedValues={status ? [status] : []}
                          onSelectionChange={(values) =>
                            setStatus((values[0] as typeof status) ?? undefined)
                          }
                          onClear={() => setStatus(undefined)}
                        />
                        <CheckboxFilterDropdown
                          label="Categoria"
                          options={categoryOptions.map((c) => ({ value: c.value, label: c.label }))}
                          selectedValues={categoryId ? [categoryId] : []}
                          onSelectionChange={(values) => setCategoryId(values[0] ?? undefined)}
                          onClear={() => setCategoryId(undefined)}
                        />
                      </div>
                    }
                    rightSection={
                      hasActiveFilters ? (
                        <BrandButton variant="ghost" size="sm" onClick={clearFilters}>
                          Limpar filtros
                        </BrandButton>
                      ) : undefined
                    }
                  />
                </div>

                <div className="flex-1 min-h-0 pb-12">
                  {loadingEntries ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                  ) : entriesError ? (
                    <div className="text-center py-12 text-destructive">
                      {entriesError instanceof Error
                        ? entriesError.message
                        : "Erro ao carregar transações"}
                    </div>
                  ) : entriesByDay.size > 0 ? (
                    <div className="max-w-3xl space-y-6 py-4">
                      {Array.from(entriesByDay.entries())
                        .sort(
                          ([dateA], [dateB]) =>
                            new Date(dateB).getTime() - new Date(dateA).getTime(),
                        )
                        .map(([dateKey, dayEntries]) => (
                          <TransactionDayGroup
                            key={dateKey}
                            date={new Date(dateKey)}
                            entries={dayEntries}
                            onEdit={handleEdit}
                            onDelete={(entry) => {
                              void handleDelete(entry);
                            }}
                          />
                        ))}

                      <div
                        ref={sentinelRef}
                        className="flex justify-center pt-6 min-h-8 items-center"
                      >
                        {isFetchingNextPage ? (
                          <span className="text-sm text-muted-foreground">
                            Carregando mais movimentações...
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Nenhuma movimentação encontrada</p>
                      <BrandButton
                        variant="neutral"
                        size="sm"
                        className="mt-4 gap-2"
                        onClick={() => dialog.openCreate("income")}
                      >
                        <Plus size={16} />
                        Nova transação
                      </BrandButton>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </PageContentWrapper>
        </div>
      </PageContentHeader>

      <TransactionModal
        open={dialog.open}
        onOpenChange={(open) => {
          dialog.setOpen(open);
          if (!open) dialog.close();
        }}
        mode={dialog.mode}
        defaultType={dialog.defaultType}
        entry={dialog.entry}
      />
    </>
  );
}
