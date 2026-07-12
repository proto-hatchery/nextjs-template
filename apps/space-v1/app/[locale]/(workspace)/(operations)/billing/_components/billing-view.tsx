"use client";

import type { ChargeWithRelations, PaymentStatus } from "@workspace/supabase-data/types/entities";
import type { ReactNode, RefObject } from "react";

import { PageContentHeader } from "../../../_components/page-content-header";
import { PageContentWrapper } from "../../../_components/page-content-wrapper";
import type { BillingRow } from "../types/billing-row";
import { BillingEmptyState } from "./billing-empty-state";
import { BillingMobileList } from "./billing-mobile-list";
import { BillingMobileSkeleton, BillingTableSkeleton } from "./billing-skeleton";
import { BillingTable } from "./billing-table";

interface BillingViewProps {
  breadcrumbs: ReactNode;
  actions: ReactNode;
  rows: BillingRow[];
  charges: ChargeWithRelations[];
  isPending: boolean;
  error: Error | null;
  isFetchingNextPage: boolean;
  sentinelRef: RefObject<HTMLDivElement | null>;
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: PaymentStatus) => void;
  onRowClick?: (row: BillingRow) => void;
}

export function BillingView({
  breadcrumbs,
  actions,
  rows,
  charges,
  isPending,
  error,
  isFetchingNextPage,
  sentinelRef,
  onRefresh,
  onUpdateStatus,
  onRowClick,
}: BillingViewProps) {
  return (
    <PageContentHeader breadcrumbs={breadcrumbs} actions={actions}>
      <div className="h-full overflow-y-auto">
        <PageContentWrapper>
          {error || isPending || rows.length === 0 ? (
            error ? (
              <>
                {/* Desktop: Table with error */}
                <div className="hidden md:block">
                  <BillingTable rows={[]} hasError={true} onRefresh={onRefresh} />
                </div>
                {/* Mobile: Error state */}
                <div className="md:hidden">
                  <BillingMobileList charges={[]} hasError={true} onRefresh={onRefresh} />
                </div>
              </>
            ) : isPending ? (
              <>
                {/* Desktop: Table skeleton */}
                <div className="hidden md:block">
                  <BillingTableSkeleton />
                </div>

                {/* Mobile: List skeleton */}
                <div className="md:hidden">
                  <BillingMobileSkeleton />
                </div>
              </>
            ) : (
              <BillingEmptyState />
            )
          ) : (
            <>
              {/* Desktop: Table view */}
              <div className="hidden md:block">
                <BillingTable
                  rows={rows}
                  onRefresh={onRefresh}
                  sentinelRef={sentinelRef}
                  isFetchingNextPage={isFetchingNextPage}
                  onRowClick={onRowClick ?? undefined}
                />
              </div>

              {/* Mobile: Card list view */}
              <div className="md:hidden">
                <BillingMobileList
                  charges={charges}
                  onRefresh={onRefresh}
                  sentinelRef={sentinelRef}
                  isFetchingNextPage={isFetchingNextPage}
                  onUpdateStatus={onUpdateStatus}
                />
              </div>
            </>
          )}
        </PageContentWrapper>
      </div>
    </PageContentHeader>
  );
}
