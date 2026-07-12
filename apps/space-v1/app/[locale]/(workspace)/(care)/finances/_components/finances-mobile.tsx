"use client";

import type { FinancialEntryWithDetails, FinancialSummary } from "@workspace/supabase-data/types/entities";
import { BrandButton } from "@workspace/brand/components/brand-button";

import { PageContentWrapper } from "../../../_components/page-content-wrapper";
import { MobileSummaryCards } from "./mobile-summary-cards";
import { MobileTransactionList } from "./mobile-transaction-list";

interface FinancesMobileProps {
  summary?: FinancialSummary;
  loadingSummary?: boolean;
  entries: FinancialEntryWithDetails[];
  loadingEntries?: boolean;
  periodLabel: string;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage?: boolean;
  onEdit: (entry: FinancialEntryWithDetails) => void;
  onAdd: () => void;
}

export function FinancesMobile({
  summary,
  loadingSummary,
  entries,
  loadingEntries,
  periodLabel,
  sentinelRef,
  isFetchingNextPage,
  onEdit,
  onAdd,
}: FinancesMobileProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PageContentWrapper>
        <div className="flex flex-col gap-6 pt-4 pb-10">
          {/* Summary Section */}
          <section className="animate-in fade-in slide-in-from-top-4 duration-500">
            <MobileSummaryCards
              {...(summary !== undefined ? { summary } : {})}
              {...(loadingSummary !== undefined ? { isPending: loadingSummary } : {})}
              periodLabel={periodLabel}
            />
          </section>

          {/* New Transaction Button */}
          <div className="px-1 -mt-2">
            <BrandButton
              onClick={onAdd}
              variant="secondary"
              className="w-full h-11 rounded-full font-bold border-none"
            >
              Lançar
            </BrandButton>
          </div>

          {/* Transactions Section */}
          <section className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-bold tracking-tight">Movimentações</h2>
              </div>
            </div>

            <MobileTransactionList
              entries={entries}
              {...(loadingEntries !== undefined ? { isPending: loadingEntries } : {})}
              onEdit={onEdit}
              sentinelRef={sentinelRef}
              {...(isFetchingNextPage !== undefined ? { isFetchingNextPage } : {})}
            />
          </section>
        </div>
      </PageContentWrapper>
    </div>
  );
}
