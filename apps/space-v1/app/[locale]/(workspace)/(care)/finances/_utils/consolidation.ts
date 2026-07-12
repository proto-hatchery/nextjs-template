/**
 * Utility functions for handling consolidated financial entries.
 * Consolidated entries are auto-generated from paid charges and cannot be edited directly.
 */

import type { FinancialEntryWithDetails } from "@workspace/supabase-data/types/entities";

/**
 * Checks if an entry is a consolidated daily entry (auto-generated from paid charges).
 * These entries cannot be edited directly - they are managed through charge status changes.
 */
export function isConsolidatedEntry(entry: FinancialEntryWithDetails): boolean {
  return entry.description?.startsWith("Serviços Prestados") ?? false;
}

/**
 * Message shown to users when they try to edit a consolidated entry.
 */
export const CONSOLIDATED_ENTRY_MESSAGE =
  "Esta entrada é gerada automaticamente a partir de cobranças pagas. Para alterar, modifique o status da cobrança correspondente na página de Faturamento.";
