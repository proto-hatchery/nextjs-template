"use client";

import { numberToCurrency } from "@workspace/forms/utils/formatting";
import type { FinancialEntryWithDetails } from "@workspace/supabase-data/types/entities";
import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefreshCw } from "lucide-react";

import { isConsolidatedEntry } from "../_utils/consolidation";
import { getCategoryIcon } from "../_utils/icons";

interface TransactionListItemProps {
  entry: FinancialEntryWithDetails;
  onEdit: (entry: FinancialEntryWithDetails) => void;
  onDelete: (entry: FinancialEntryWithDetails) => void;
}

export function TransactionListItem({ entry, onEdit }: TransactionListItemProps) {
  const isExpense = entry.type === "expense";
  const isConsolidated = isConsolidatedEntry(entry);
  const amountValue = (entry.amount ?? 0) / 100;
  const amountLabel = `${isExpense ? "-" : "+"}${numberToCurrency(amountValue)}`;

  const categoryName = entry.categoryName ?? (isExpense ? "Despesa" : "Receita");
  const description = entry.description ?? categoryName;
  const date = entry.date_time
    ? format(new Date(entry.date_time), "dd/MM", { locale: ptBR })
    : "--/--";

  const entryType = entry.type === "income" || entry.type === "expense" ? entry.type : undefined;
  // Para entradas consolidadas, usa a descrição para determinar o ícone
  const iconKey = isConsolidated ? entry.description : entry.categoryName;
  const Icon = getCategoryIcon(iconKey, entryType);

  return (
    <BrandButton
      variant="ghost"
      onClick={() => onEdit(entry)}
      className="flex items-center w-full gap-4 px-1 py-3 transition-all hover:bg-muted/30 rounded-lg active:scale-[0.99] text-left group h-auto justify-start"
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors relative",
          isExpense
            ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-900/50"
            : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50",
        )}
      >
        <Icon className="h-6 w-6" />
        {isConsolidated && (
          <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 text-white rounded-full p-0.5">
            <RefreshCw className="h-2.5 w-2.5" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col truncate">
        <span className="text-sm font-bold text-foreground truncate tracking-tight uppercase">
          {description}
        </span>
        <span className="text-xs font-medium text-muted-foreground truncate">
          {categoryName}
          {isConsolidated && (
            <span className="ml-1.5 text-[10px] text-blue-600 dark:text-blue-400 font-medium">
              • Sincronizado
            </span>
          )}
        </span>
      </div>

      <div className="flex flex-col items-end gap-0.5">
        <span
          className={cn(
            "text-sm font-bold tracking-tight",
            isExpense ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400",
          )}
        >
          {amountLabel}
        </span>
        <span className="text-[10px] text-muted-foreground font-medium">{date}</span>
      </div>
    </BrandButton>
  );
}
