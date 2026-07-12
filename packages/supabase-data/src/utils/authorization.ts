import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;

type OwnershipQuery = {
  select: (columns: string) => OwnershipQuery;
  eq: (column: string, value: string) => OwnershipQuery;
  maybeSingle: () => Promise<{ data: unknown; error: unknown }>;
};

/**
 * Verifies if a patient belongs to a psychologist.
 *
 * @param supabase - Typed Supabase client
 * @param psychologistId - The authenticated user's ID
 * @param patientId - The ID of the patient to check
 * @returns boolean - True if the patient belongs to the psychologist
 */
export async function verifyPatientOwnership(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  patientId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("psychologist_patients")
    .select("id")
    .eq("id", patientId)
    .eq("psychologist_id", psychologistId)
    .maybeSingle();

  return !!data && !error;
}

/**
 * Generic helper to verify if a record in a table belongs to a psychologist.
 * Assumes the table has a 'psychologist_id' column.
 *
 * @param supabase - Typed Supabase client
 * @param table - The table name
 * @param psychologistId - The authenticated user's ID
 * @param resourceId - The ID of the resource to check
 * @returns boolean - True if the resource belongs to the psychologist
 */
export async function verifyResourceOwnership(
  supabase: TypedSupabaseClient,
  table: string,
  psychologistId: string,
  resourceId: string,
): Promise<boolean> {
  const db = supabase as unknown as { from: (tableName: string) => OwnershipQuery };

  const { data, error } = await db
    .from(table)
    .select("id")
    .eq("id", resourceId)
    .eq("psychologist_id", psychologistId)
    .maybeSingle();

  return !!data && !error;
}
