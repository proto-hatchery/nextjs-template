"use client";

import type { FinancialEntryWithDetails } from "@workspace/supabase-data/types/entities";
import { useState } from "react";

export type TransactionDialogMode = "create" | "edit";

export function useTransactionDialog() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<TransactionDialogMode>("create");
  const [entry, setEntry] = useState<FinancialEntryWithDetails | null>(null);
  const [defaultType, setDefaultType] = useState<"income" | "expense">("income");

  const openCreate = (type: "income" | "expense" = "income") => {
    setMode("create");
    setDefaultType(type);
    setEntry(null);
    setOpen(true);
  };

  const openEdit = (item: FinancialEntryWithDetails) => {
    setMode("edit");
    setEntry(item);
    setDefaultType(item.type === "expense" ? "expense" : "income");
    setOpen(true);
  };

  const close = () => setOpen(false);

  return { open, mode, entry, defaultType, openCreate, openEdit, close, setOpen };
}
