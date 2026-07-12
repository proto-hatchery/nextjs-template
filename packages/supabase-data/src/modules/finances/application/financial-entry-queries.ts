import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  CategorySummary,
  FinancialEntryFilters,
  FinancialEntryWithDetails,
  FinancialPeriod,
  FinancialSummary,
} from "@workspace/supabase-data/types/entities";
import { safeLogger } from "../../../utils/safe-logger";

type TypedSupabaseClient = SupabaseClient<Database>;
type FinancialEntryRow = Database["public"]["Tables"]["psychologist_financial_entries"]["Row"];
type ReferenceMetadata = Database["public"]["Tables"]["reference_values"]["Row"]["metadata"];

interface EntryWithJoins extends FinancialEntryRow {
  category_rel:
    | {
        label_pt: string;
        value: string;
        metadata: ReferenceMetadata;
      }
    | {
        label_pt: string;
        value: string;
        metadata: ReferenceMetadata;
      }[]
    | null;
}

function toFinancialEntryWithDetails(entry: EntryWithJoins): FinancialEntryWithDetails {
  const category = Array.isArray(entry.category_rel) ? entry.category_rel[0] : entry.category_rel;
  return {
    ...entry,
    categoryName: category?.label_pt ?? null,
    categoryColor: null,
    patientName: null,
  };
}

export async function listFinancialEntries(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  filters?: FinancialEntryFilters,
): Promise<FinancialEntryWithDetails[]> {
  let query = supabase
    .from("psychologist_financial_entries")
    .select(
      `
      *,
      category_rel:reference_values!psychologist_financial_entries_transaction_category_id_fkey (
        label_pt,
        value,
        metadata
      )
    `,
    )
    .eq("psychologist_id", psychologistId)
    .order("date_time", { ascending: false });

  if (filters?.type) {
    query = query.eq("type", filters.type);
  }
  if (filters?.categoryId) {
    query = query.eq("transaction_category_id", filters.categoryId);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.startDate) {
    query = query.gte("date_time", filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte("date_time", filters.endDate);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit ?? 20) - 1);
  }

  const { data, error } = await query;
  if (error) {
    safeLogger.error("[listFinancialEntries] Error:", error);
    throw error;
  }

  return ((data ?? []) as EntryWithJoins[]).map(toFinancialEntryWithDetails);
}

export async function listRecentFinancialEntries(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  limit = 10,
): Promise<FinancialEntryWithDetails[]> {
  return listFinancialEntries(supabase, psychologistId, { limit });
}

export async function listTransactionCategories(
  supabase: TypedSupabaseClient,
): Promise<{ id: string; name: string; type: string; is_selectable: boolean }[]> {
  const { data, error } = await supabase
    .from("reference_values")
    .select("id, value, label_pt, metadata")
    .eq("category", "financial_transaction_category")
    .eq("is_active", true)
    .order("label_pt");

  if (error) {
    safeLogger.error("[listTransactionCategories] Error:", error);
    throw error;
  }

  return (data ?? []).map((item) => {
    const metadata = item.metadata as { type?: string } | null;
    return {
      id: item.id,
      name: item.label_pt,
      type: metadata?.type?.toUpperCase() || "EXPENSE",
      is_selectable: true,
    };
  });
}

export async function getFinancialSummary(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  period: FinancialPeriod,
): Promise<FinancialSummary> {
  const [entriesResult, pendingChargesResult, overdueChargesResult] = await Promise.all([
    supabase
      .from("psychologist_financial_entries")
      .select(
        `
        type,
        amount,
        transaction_category_id,
        category:reference_values!psychologist_financial_entries_transaction_category_id_fkey (
          label_pt,
          value,
          metadata
        )
      `,
      )
      .eq("psychologist_id", psychologistId)
      .eq("status", "confirmed")
      .gte("date_time", period.startDate)
      .lte("date_time", period.endDate),
    supabase
      .from("psychologist_patient_charges")
      .select("price_cents")
      .eq("psychologist_id", psychologistId)
      .eq("payment_status", "pending"),
    supabase
      .from("psychologist_patient_charges")
      .select("price_cents")
      .eq("psychologist_id", psychologistId)
      .eq("payment_status", "overdue"),
  ]);

  if (entriesResult.error) {
    safeLogger.error("[getFinancialSummary] Entries error:", entriesResult.error);
    throw entriesResult.error;
  }

  if (pendingChargesResult.error) {
    safeLogger.error("[getFinancialSummary] Pending charges error:", pendingChargesResult.error);
    throw pendingChargesResult.error;
  }

  if (overdueChargesResult.error) {
    safeLogger.error("[getFinancialSummary] Overdue charges error:", overdueChargesResult.error);
    throw overdueChargesResult.error;
  }

  let totalIncome = 0;
  let totalExpenses = 0;
  const incomeByCategory: Record<string, CategorySummary> = {};
  const expensesByCategory: Record<string, CategorySummary> = {};

  for (const entry of entriesResult.data ?? []) {
    const amount = entry.amount ?? 0;
    const categoryId = entry.transaction_category_id ?? "uncategorized";
    const category = Array.isArray(entry.category) ? entry.category[0] : entry.category;
    const categoryData = category as { label_pt: string } | null;
    const categoryName = categoryData?.label_pt ?? "Sem categoria";
    const categoryColor = null;

    if (entry.type === "income") {
      totalIncome += amount;

      if (!incomeByCategory[categoryId]) {
        incomeByCategory[categoryId] = {
          categoryId,
          categoryName,
          categoryColor,
          total: 0,
          count: 0,
        };
      }

      incomeByCategory[categoryId]!.total += amount;
      incomeByCategory[categoryId]!.count += 1;
    } else {
      totalExpenses += amount;

      if (!expensesByCategory[categoryId]) {
        expensesByCategory[categoryId] = {
          categoryId,
          categoryName,
          categoryColor,
          total: 0,
          count: 0,
        };
      }

      expensesByCategory[categoryId]!.total += amount;
      expensesByCategory[categoryId]!.count += 1;
    }
  }

  const pendingTotal = (pendingChargesResult.data ?? []).reduce(
    (sum, charge) => sum + (charge.price_cents ?? 0),
    0,
  );
  const overdueTotal = (overdueChargesResult.data ?? []).reduce(
    (sum, charge) => sum + (charge.price_cents ?? 0),
    0,
  );

  return {
    period,
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    incomeByCategory: Object.values(incomeByCategory).sort((a, b) => b.total - a.total),
    expensesByCategory: Object.values(expensesByCategory).sort((a, b) => b.total - a.total),
    pendingCharges: pendingTotal,
    overdueCharges: overdueTotal,
  };
}

export async function getNegotiatedPrice(
  supabase: TypedSupabaseClient,
  patientId: string,
  serviceId: string,
): Promise<number | null> {
  const { data, error } = await supabase
    .from("psychologist_patient_services")
    .select("price_cents")
    .eq("psychologist_patient_id", patientId)
    .eq("service_id", serviceId)
    .maybeSingle();

  if (error) {
    safeLogger.error("[getNegotiatedPrice] Error:", error);
    throw error;
  }

  return data?.price_cents ?? null;
}
