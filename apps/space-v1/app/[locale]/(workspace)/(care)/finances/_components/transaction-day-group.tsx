"use client";

import type { FinancialEntryWithDetails } from "@workspace/supabase-data/types/entities";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { TransactionListItem } from "./transaction-list-item";

interface TransactionDayGroupProps {
  date: Date;
  entries: FinancialEntryWithDetails[];
  onEdit: (entry: FinancialEntryWithDetails) => void;
  onDelete: (entry: FinancialEntryWithDetails) => void;
}

export function TransactionDayGroup({ date, entries, onEdit, onDelete }: TransactionDayGroupProps) {
  const dayOfWeek = format(date, "eeeeee", { locale: ptBR });
  const restOfDate = format(date, "dd 'de' MMM 'de' yyyy", { locale: ptBR });
  const formattedDate = `${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)}, ${restOfDate}`;

  return (
    <div className="flex flex-col gap-2">
      {/* Date Header - Simple and clean */}
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
        {formattedDate}
      </h3>

      {/* Transactions for this day */}
      <div className="flex flex-col">
        {entries.map((entry) => (
          <TransactionListItem key={entry.id} entry={entry} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
