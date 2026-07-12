"use client";

import type { ChargeWithRelations, PaymentStatus } from "@workspace/supabase-data/types/entities";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/brand/patterns/components/empty";
import { Receipt } from "lucide-react";
import { useState } from "react";

import { BillingActionSheet } from "./billing-action-sheet";
import { BillingCard } from "./billing-card";

interface BillingMobileListProps {
  charges: ChargeWithRelations[];
  hasError?: boolean;
  errorMessage?: string;
  onRefresh?: () => void;
  sentinelRef?: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage?: boolean;
  onConfirmPayment?: (chargeId: string) => void;
  onUpdateStatus?: (chargeId: string, status: PaymentStatus) => void;
  onUpdateMethod?: (chargeId: string, currentMethod: string) => void;
  onUpdateValue?: (chargeId: string, currentValue: number) => void;
  onDelete?: (chargeId: string) => void;
}

export function BillingMobileList({
  charges,
  hasError,
  errorMessage,
  sentinelRef,
  isFetchingNextPage = false,
  onConfirmPayment,
  onUpdateStatus,
  onUpdateMethod,
  onUpdateValue,
  onDelete,
}: BillingMobileListProps) {
  const [selectedCharge, setSelectedCharge] = useState<ChargeWithRelations | null>(null);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  const handleCardClick = (charge: ChargeWithRelations) => {
    setSelectedCharge(charge);
    setIsActionSheetOpen(true);
  };

  const isEmpty = !charges || charges.length === 0;

  // Empty or error states
  if (hasError || isEmpty) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        {hasError ? (
          <div className="text-center max-w-xl mx-auto">
            <h3 className="text-lg font-semibold text-destructive">Erro ao carregar cobranças</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              {errorMessage ?? "Dados não disponíveis"}
            </p>
          </div>
        ) : (
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Receipt className="size-6" />
              </EmptyMedia>
              <EmptyTitle>Nenhuma cobrança registrada</EmptyTitle>
              <EmptyDescription>
                Comece a registrar suas cobranças para manter o controle financeiro do seu
                consultório.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2 p-4">
        {charges.map((charge) => (
          <BillingCard key={charge.id} charge={charge} onClick={() => handleCardClick(charge)} />
        ))}

        {/* Sentinel for infinite scroll */}
        {sentinelRef && (
          <div ref={sentinelRef} className="h-4 flex items-center justify-center py-4">
            {isFetchingNextPage && (
              <p className="text-sm text-muted-foreground">Carregando mais...</p>
            )}
          </div>
        )}
      </div>

      {/* Action Sheet */}
      <BillingActionSheet
        charge={selectedCharge}
        open={isActionSheetOpen}
        onOpenChange={setIsActionSheetOpen}
        onUpdateStatus={(id, status) => onUpdateStatus?.(id, status)}
        onUpdateMethod={(id, method) => onUpdateMethod?.(id, method)}
        onUpdateValue={(id, value) => onUpdateValue?.(id, value)}
        onDelete={(id) => onDelete?.(id)}
        onConfirmPayment={onConfirmPayment}
      />
    </>
  );
}
