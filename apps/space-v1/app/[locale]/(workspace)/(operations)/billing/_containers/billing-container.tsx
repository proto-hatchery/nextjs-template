"use client";

import type { InfiniteData } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import type { PaginatedChargesResponse, PaymentStatus } from "@workspace/supabase-data/types/entities";
import { updateChargeStatusAction } from "@workspace/supabase-data/actions/billing/update-charge-status";
import { useChargesWithPagination } from "@workspace/supabase-data/hooks/billing";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { queryKeys } from "@workspace/supabase-data/utils/query-keys";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { Home, Receipt } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { BillingView } from "../_components/billing-view";
import { ChargeDetailsDialog } from "../_components/charge-details-dialog";
import { transformBillingsToRows } from "../_data/billing-rows";
import type { BillingRow } from "../types/billing-row";

export function BillingContainer() {
  const [detailsState, setDetailsState] = useState<{
    open: boolean;
    charge: BillingRow | null;
    rawMethod: string;
  }>({
    open: false,
    charge: null,
    rawMethod: "pix",
  });

  const sentinelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { charges, hasNextPage, isPending, error, isFetchingNextPage, fetchNextPage, refetch } =
    useChargesWithPagination({
      pageSize: 20,
      enabled: true,
    });

  const handleUpdateStatus = async (id: string, status: PaymentStatus) => {
    const queryKey = queryKeys.financial.chargesPaginated(20);
    const previousData = queryClient.getQueryData<InfiniteData<PaginatedChargesResponse>>(queryKey);

    queryClient.setQueryData<InfiniteData<PaginatedChargesResponse>>(queryKey, (old) => {
      if (!old?.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.map((item) =>
            item.id === id ? { ...item, payment_status: status } : item,
          ),
        })),
      } satisfies InfiniteData<PaginatedChargesResponse>;
    });

    try {
      unwrapActionResult(await updateChargeStatusAction({
        chargeId: id,
        status,
      }));
      toast.success("Status atualizado com sucesso");
    } catch {
      toast.error("Erro ao atualizar status");
      queryClient.setQueryData(queryKey, previousData);
    }
  };

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || !fetchNextPage) {
      return;
    }

    const el = sentinelRef.current;
    if (!el) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage && fetchNextPage) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: "200px", threshold: 0.1 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const rows = useMemo(() => transformBillingsToRows(charges), [charges]);

  const breadcrumbs = useMemo(() => {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/home" className="inline-flex items-center gap-1.5">
              <Home className="size-4" />
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="inline-flex items-center gap-1.5">
              <Receipt className="size-4" />
              Cobranças
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }, []);

  return (
    <>
      <BillingView
        breadcrumbs={breadcrumbs}
        actions={null}
        rows={rows}
        charges={charges}
        isPending={isPending}
        error={error}
        isFetchingNextPage={isFetchingNextPage}
        sentinelRef={sentinelRef}
        onRefresh={refetch}
        onUpdateStatus={(id, status) => {
          void handleUpdateStatus(id, status);
        }}
        onRowClick={(row) => {
          const charge = charges.find((c) => c.id === row.id);
          setDetailsState({
            open: true,
            charge: row,
            rawMethod: charge?.payment_method ?? "pix",
          });
        }}
      />

      <ChargeDetailsDialog
        open={detailsState.open}
        onOpenChange={(open) => setDetailsState((prev) => ({ ...prev, open }))}
        charge={detailsState.charge}
        rawMethod={detailsState.rawMethod}
      />
    </>
  );
}
