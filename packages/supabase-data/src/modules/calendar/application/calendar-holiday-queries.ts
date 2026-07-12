import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";
import type { CalendarHoliday, CalendarHolidayFilters } from "@workspace/supabase-data/types/entities";

type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Fetches calendar holidays from the database
 */
export async function fetchCalendarHolidays(
  supabase: TypedSupabaseClient,
  filters: CalendarHolidayFilters,
): Promise<CalendarHoliday[]> {
  let query = supabase.from("calendar_holidays").select("*").order("date", { ascending: true });

  if (filters.year) {
    query = query.eq("year", filters.year);
  }

  if (filters.state) {
    query = query.eq("state", filters.state);
  }

  if (filters.city) {
    query = query.eq("city", filters.city);
  }

  if (filters.startDate) {
    query = query.gte("date", filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte("date", filters.endDate);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}
