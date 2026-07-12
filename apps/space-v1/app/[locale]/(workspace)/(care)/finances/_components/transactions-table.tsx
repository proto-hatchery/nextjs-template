"use client";

import { numberToCurrency } from "@workspace/forms/utils/formatting";
import type { FinancialEntryWithDetails, PaymentMethod } from "@workspace/supabase-data/types/entities";
import { Badge } from "@workspace/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { BrandButton } from "@workspace/brand/components/brand-button";
import {
  FluriDialogV2,
  FluriDialogV2Content,
  FluriDialogV2Description,
  FluriDialogV2Footer,
  FluriDialogV2Header,
  FluriDialogV2Title,
} from "@workspace/brand/overlays/fluri-dialog-v2";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, Loader2, MoreVertical, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { CONSOLIDATED_ENTRY_MESSAGE, isConsolidatedEntry } from "../_utils/consolidation";
import { FinancesEmptyState } from "./finances-empty-state";

interface TransactionsTableProps {
  entries: FinancialEntryWithDetails[];
  isPending?: boolean;
  error?: string;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onEdit: (entry: FinancialEntryWithDetails) => void;
  onDelete: (entry: FinancialEntryWithDetails) => Promise<void> | void;
  onAdd?: () => void;
  canGoNext?: boolean;
}

const STATUS_LABELS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  confirmed: { label: "Confirmada", variant: "default" },
  pending: { label: "Pendente", variant: "secondary" },
  cancelled: { label: "Cancelada", variant: "destructive" },
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  fluripay: "FluriPay",
  card: "Cartão",
  cash: "Dinheiro",
  pix: "PIX",
  bank_transfer: "Transf. bancária",
  other: "Outro",
};

function formatDate(value: string | null): string {
  if (!value) return "--";
  return format(new Date(value), "dd MMM yyyy, HH:mm", { locale: ptBR });
}

export function TransactionsTable({
  entries,
  isPending,
  error,
  page,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
  onAdd: _onAdd,
  canGoNext,
}: TransactionsTableProps) {
  const [entryToDelete, setEntryToDelete] = useState<FinancialEntryWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!entryToDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(entryToDelete);
      setEntryToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const computedCanGoNext = typeof canGoNext === "boolean" ? canGoNext : entries.length >= pageSize;
  const isEmpty = !isPending && entries.length === 0 && !error;

  return (
    <>
      <div className="flex flex-col h-full">
        <div
          className={`flex-1 min-h-0 rounded-xl overflow-hidden flex flex-col ${isEmpty ? "" : "border bg-card text-card-foreground shadow-sm"}`}
        >
          {error && (
            <div className="m-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isPending ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Carregando transações...</span>
              </div>
            </div>
          ) : isEmpty ? (
            <FinancesEmptyState />
          ) : (
            <>
              <div className="relative w-full overflow-auto flex-1">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-border/50">
                      <TableHead className="w-[160px] pl-6">Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="w-[160px]">Categoria</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[120px]">Pagamento</TableHead>
                      <TableHead className="w-[120px] text-right">Valor</TableHead>
                      <TableHead className="w-[70px] text-right pr-6">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => {
                      const statusKey = entry.status ?? "pending";
                      const statusInfo = STATUS_LABELS[statusKey] ?? STATUS_LABELS.pending;
                      const isExpense = entry.type === "expense";
                      const isConsolidated = isConsolidatedEntry(entry);
                      const paymentMethod = entry.payment_method;
                      const description =
                        entry.description && entry.description.length > 0
                          ? entry.description
                          : isExpense
                            ? "Despesa"
                            : "Receita";
                      const categoryLabel =
                        entry.categoryName && entry.categoryName.length > 0
                          ? entry.categoryName
                          : "Sem categoria";
                      // Convert from cents to reais for display
                      const amountValue = (entry.amount ?? 0) / 100;
                      const amountLabel = `${isExpense ? "-" : "+"}${numberToCurrency(amountValue)}`;

                      const handleEditClick = () => {
                        if (isConsolidated) {
                          toast.info("Entrada sincronizada", {
                            description: CONSOLIDATED_ENTRY_MESSAGE,
                          });
                          return;
                        }
                        onEdit(entry);
                      };

                      const handleDeleteClick = () => {
                        if (isConsolidated) {
                          toast.info("Entrada sincronizada", {
                            description: CONSOLIDATED_ENTRY_MESSAGE,
                          });
                          return;
                        }
                        setEntryToDelete(entry);
                      };

                      return (
                        <TableRow
                          key={entry.id}
                          className="group border-b border-border/40 hover:bg-muted/30 transition-colors"
                        >
                          <TableCell className="whitespace-nowrap text-muted-foreground pl-6 font-medium text-xs">
                            {formatDate(entry.date_time)}
                          </TableCell>
                          <TableCell className="max-w-[220px] truncate font-medium text-sm">
                            <div className="flex items-center gap-2">
                              {description}
                              {isConsolidated && (
                                <Badge
                                  variant="secondary"
                                  className="gap-1 border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400 font-normal text-[10px]"
                                >
                                  <RefreshCw className="h-2.5 w-2.5" />
                                  Sincronizado
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[160px] truncate text-muted-foreground text-sm">
                            {categoryLabel}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`
                                font-normal
                                ${statusKey === "confirmed" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400" : ""}
                                ${statusKey === "pending" ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400" : ""}
                                ${statusKey === "cancelled" ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400" : ""}
                              `}
                            >
                              {statusInfo?.label ?? "Desconhecido"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {paymentMethod ? (
                              <span className="text-xs text-muted-foreground capitalize">
                                {PAYMENT_LABELS[paymentMethod]}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={
                                isExpense
                                  ? "font-medium text-red-600 dark:text-red-400"
                                  : "font-medium text-emerald-600 dark:text-emerald-400"
                              }
                            >
                              {amountLabel}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <BrandButton
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </BrandButton>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={handleEditClick}
                                  className="gap-2"
                                  disabled={isConsolidated}
                                >
                                  <Pencil className="h-4 w-4" />
                                  {isConsolidated ? "Não editável" : "Editar"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="gap-2 text-destructive focus:text-destructive"
                                  onSelect={(e) => e.preventDefault()}
                                  onClick={handleDeleteClick}
                                  disabled={isConsolidated}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  {isConsolidated ? "Não removível" : "Remover"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between border-t border-border/50 px-6 py-4 bg-muted/5">
                <div className="text-xs text-muted-foreground">
                  Página <span className="font-medium text-foreground">{page}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BrandButton
                    variant="ghost"
                    size="sm"
                    disabled={(isPending ?? false) || page <= 1}
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    className="h-8"
                  >
                    Anterior
                  </BrandButton>
                  <BrandButton
                    variant="ghost"
                    size="sm"
                    disabled={(isPending ?? false) || !computedCanGoNext}
                    onClick={() => onPageChange(page + 1)}
                    className="h-8"
                  >
                    Próxima
                  </BrandButton>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <FluriDialogV2
        open={!!entryToDelete}
        onOpenChange={(open) => !open && setEntryToDelete(null)}
      >
        <FluriDialogV2Content>
          <FluriDialogV2Header>
            <FluriDialogV2Title>Remover transação</FluriDialogV2Title>
            <FluriDialogV2Description>
              Essa ação não pode ser desfeita. Confirma remover{" "}
              <strong>{entryToDelete?.description ?? "a transação"}</strong>?
            </FluriDialogV2Description>
          </FluriDialogV2Header>
          <FluriDialogV2Footer>
            <BrandButton
              variant="neutral"
              onClick={() => setEntryToDelete(null)}
              disabled={isDeleting}
            >
              Cancelar
            </BrandButton>
            <BrandButton
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? "Removendo..." : "Remover"}
            </BrandButton>
          </FluriDialogV2Footer>
        </FluriDialogV2Content>
      </FluriDialogV2>
    </>
  );
}
