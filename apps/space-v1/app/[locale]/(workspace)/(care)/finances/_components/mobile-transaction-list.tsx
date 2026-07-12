"use client";

import type { FinancialEntryWithDetails } from "@workspace/supabase-data/types/entities";
import { Loader2 } from "lucide-react";

import { FinancesEmptyState } from "./finances-empty-state";
import { MobileTransactionItem } from "./mobile-transaction-item";

interface MobileTransactionListProps {
  entries: FinancialEntryWithDetails[];
  isPending?: boolean;
  onEdit: (entry: FinancialEntryWithDetails) => void;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage?: boolean;
}

export function MobileTransactionList({
  entries,
  isPending,
  onEdit,
  sentinelRef,
  isFetchingNextPage = false,
}: MobileTransactionListProps) {
  if (isPending && entries.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-sm font-medium">Carregando movimentações...</span>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return <FinancesEmptyState />;
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-1">
        {entries.map((entry) => (
          <MobileTransactionItem key={entry.id} entry={entry} onClick={onEdit} />
        ))}
      </div>
      <div ref={sentinelRef} className="mt-8 mb-20 h-6 px-1 flex items-center justify-center">
        {isFetchingNextPage ? (
          <span className="text-sm text-muted-foreground">Carregando mais movimentações...</span>
        ) : null}
      </div>
    </div>
  );
}
