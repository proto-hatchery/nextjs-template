"use client";

import type { ChargeWithRelations, PaymentStatus } from "@workspace/supabase-data/types/entities";
import { Sheet, SheetContent, SheetTitle } from "@workspace/ui/components/sheet";
import { VisuallyHidden } from "@workspace/ui/lib/visually-hidden";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { BadgeDollarSign } from "lucide-react";
import { CheckCircle2, CreditCard, Pencil, Trash2 } from "lucide-react";

import { resolveBillingPatientName } from "../_utils/patient-name";

interface BillingActionSheetProps {
  charge: ChargeWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (chargeId: string, status: PaymentStatus) => void;
  onUpdateMethod: (chargeId: string, currentMethod: string) => void;
  onUpdateValue: (chargeId: string, currentValue: number) => void;
  onDelete: (chargeId: string) => void;
  onConfirmPayment?: ((chargeId: string) => void) | undefined;
}

export function BillingActionSheet({
  charge,
  open,
  onOpenChange,
  onUpdateStatus,
  onUpdateMethod,
  onUpdateValue,
  onDelete,
  onConfirmPayment,
}: BillingActionSheetProps) {
  if (!charge) return null;

  const formattedAmount = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format((charge.price_cents ?? 0) / 100);

  // Get patient name from patient relation
  const patientName = resolveBillingPatientName(charge.patient ?? null);

  const handleUpdateStatus = (status: PaymentStatus) => {
    onUpdateStatus(charge.id, status);
    onOpenChange(false);
  };

  const handleUpdateMethod = () => {
    onUpdateMethod(charge.id, charge.payment_method ?? "credit_card");
    onOpenChange(false);
  };

  const handleUpdateValue = () => {
    onUpdateValue(charge.id, charge.price_cents ?? 0);
    onOpenChange(false);
  };

  const handleDelete = () => {
    onOpenChange(false);
    setTimeout(() => {
      onDelete(charge.id);
    }, 300);
  };

  const handleConfirmPayment = () => {
    if (onConfirmPayment) {
      onConfirmPayment(charge.id);
    }
    onOpenChange(false);
  };

  const canConfirmPayment = charge.payment_status === "pending" && onConfirmPayment;
  const hasDocument = false;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="p-0 pb-safe rounded-t-3xl border-t bg-background"
        showCloseButton={false}
      >
        <VisuallyHidden.Root>
          <SheetTitle>Ações da Cobrança</SheetTitle>
        </VisuallyHidden.Root>

        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-4">
          <div className="w-9 h-1 bg-border/60 rounded-full" />
        </div>

        {/* Content with max height and scroll */}
        <div className="max-h-[75vh] overflow-y-auto">
          {/* Header Info */}
          <div className="px-4 pb-6 text-center">
            <h3 className="text-[17px] font-semibold text-foreground leading-tight">
              {patientName}
            </h3>
            <p className="text-[13px] text-muted-foreground mt-1">{formattedAmount}</p>
          </div>

          {/* Status Options - Grouped card */}
          <div className="px-4 pb-3">
            <p className="text-xs font-medium text-muted-foreground mb-2 px-1">ATUALIZAR STATUS</p>
            <div className="bg-muted/50 rounded-xl overflow-hidden">
              {[
                { value: "pending", label: "Pendente" },
                { value: "paid", label: "Pago" },
                { value: "overdue", label: "Atrasado" },
                { value: "cancelled", label: "Cancelada" },
                { value: "refunded", label: "Reembolsado" },
              ].map((status, index, array) => (
                <div key={status.value} className="relative">
                  <BrandButton
                    onClick={() => handleUpdateStatus(status.value as PaymentStatus)}
                    variant="ghost"
                    className="flex items-center gap-3 px-4 py-3.5 w-full text-left h-auto"
                  >
                    <BadgeDollarSign className="w-5 h-5 text-foreground" />
                    <span className="text-[15px] text-foreground font-medium">{status.label}</span>
                    {charge.payment_status === status.value && (
                      <span className="ml-auto text-xs text-muted-foreground">(Atual)</span>
                    )}
                  </BrandButton>
                  {index !== array.length - 1 && (
                    <div className="absolute bottom-0 left-4 right-4 h-px bg-border" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Edit Actions - Grouped card */}
          <div className="px-4 pb-3">
            <p className="text-xs font-medium text-muted-foreground mb-2 px-1">EDITAR</p>
            <div className="bg-muted/50 rounded-xl overflow-hidden">
              {/* Update Method */}
              <div className="relative">
                <BrandButton
                  onClick={handleUpdateMethod}
                  variant="ghost"
                  className="flex items-center gap-3 px-4 py-3.5 w-full text-left h-auto"
                >
                  <CreditCard className="w-5 h-5 text-foreground" />
                  <span className="text-[15px] text-foreground font-medium">Meio de Pagamento</span>
                </BrandButton>
                <div className="absolute bottom-0 left-4 right-4 h-px bg-border" />
              </div>

              {/* Update Value */}
              <div className="relative">
                <BrandButton
                  onClick={handleUpdateValue}
                  variant="ghost"
                  className="flex items-center gap-3 px-4 py-3.5 w-full text-left h-auto"
                >
                  <Pencil className="w-5 h-5 text-foreground" />
                  <span className="text-[15px] text-foreground font-medium">Alterar Valor</span>
                </BrandButton>
                {hasDocument && <div className="absolute bottom-0 left-4 right-4 h-px bg-border" />}
              </div>
            </div>
          </div>

          {/* Confirm Payment - If pending */}
          {canConfirmPayment && (
            <div className="px-4 pb-3">
              <div className="bg-muted/50 rounded-xl overflow-hidden">
                <BrandButton
                  onClick={handleConfirmPayment}
                  variant="ghost"
                  className="flex items-center gap-3 px-4 py-3.5 w-full text-left h-auto"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-[15px] text-green-600 font-medium">
                    Confirmar Pagamento
                  </span>
                </BrandButton>
              </div>
            </div>
          )}

          {/* Delete Action - Separate card */}
          <div className="px-4 pb-3">
            <div className="bg-muted/50 rounded-xl overflow-hidden">
              <BrandButton
                onClick={handleDelete}
                variant="ghost"
                className="flex items-center gap-3 px-4 py-3.5 w-full text-left h-auto"
              >
                <Trash2 className="w-5 h-5 text-destructive" />
                <span className="text-[15px] text-destructive font-medium">Excluir Cobrança</span>
              </BrandButton>
            </div>
          </div>

          {/* Cancel Button */}
          <div className="px-4 pb-4">
            <div className="bg-muted/50 rounded-xl overflow-hidden">
              <BrandButton
                onClick={() => onOpenChange(false)}
                variant="ghost"
                className="flex items-center justify-center py-3.5 w-full text-[15px] font-semibold text-foreground h-auto"
              >
                Cancelar
              </BrandButton>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
