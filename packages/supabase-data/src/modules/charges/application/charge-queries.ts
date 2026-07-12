import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  ChargeFilters,
  ChargeQueryParams,
  ChargeWithDetails,
  ChargeWithRelations,
  PaginatedChargesResponse,
} from "@workspace/supabase-data/types/entities";
import { safeLogger } from "../../../utils/safe-logger";

type TypedSupabaseClient = SupabaseClient<Database>;
type ClientCharge = Database["public"]["Tables"]["psychologist_patient_charges"]["Row"];

interface ChargeWithJoins extends ClientCharge {
  patient:
    | {
        manual_full_name: string | null;
        synced_full_name: string | null;
        manual_preferred_name: string | null;
        manual_first_name: string | null;
        manual_last_name: string | null;
      }
    | {
        manual_full_name: string | null;
        synced_full_name: string | null;
        manual_preferred_name: string | null;
        manual_first_name: string | null;
        manual_last_name: string | null;
      }[]
    | null;
  session:
    | {
        start_datetime: string;
      }[]
    | {
        start_datetime: string;
      }
    | null;
}

function toChargeWithDetails(charge: ChargeWithJoins): ChargeWithDetails {
  const sessionData = Array.isArray(charge.session) ? charge.session[0] : charge.session;
  const patient = Array.isArray(charge.patient) ? charge.patient[0] : charge.patient;
  const patientNameFromParts =
    [patient?.manual_first_name, patient?.manual_last_name].filter(Boolean).join(" ").trim() ||
    null;

  return {
    ...charge,
    patientName:
      patient?.manual_preferred_name ??
      patient?.manual_full_name ??
      patient?.synced_full_name ??
      patientNameFromParts ??
      "Paciente",
    sessionDate: sessionData?.start_datetime ?? null,
    serviceName: null,
  };
}

export async function listCharges(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  filters?: ChargeFilters,
): Promise<ChargeWithDetails[]> {
  let query = supabase
    .from("psychologist_patient_charges")
    .select(
      `
      *,
      patient:psychologist_patients!psychologist_client_charges_psychologist_patient_id_fkey (
        manual_full_name,
        synced_full_name,
        manual_preferred_name,
        manual_first_name,
        manual_last_name
      ),
      session:calendar_events!psychologist_client_charges_session_id_fkey (
        start_datetime
      )
    `,
    )
    .eq("psychologist_id", psychologistId)
    .order("created_at", { ascending: false });

  if (filters?.paymentStatus) {
    if (Array.isArray(filters.paymentStatus) && filters.paymentStatus.length > 0) {
      query = query.in("payment_status", filters.paymentStatus);
    } else if (!Array.isArray(filters.paymentStatus)) {
      query = query.eq("payment_status", filters.paymentStatus);
    }
  }

  if (filters?.patientId) {
    query = query.eq("psychologist_patient_id", filters.patientId);
  }

  if (filters?.startDate) {
    query = query.gte("created_at", filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte("created_at", filters.endDate);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit ?? 20) - 1);
  }

  const { data, error } = await query;
  if (error) {
    safeLogger.error("[listCharges] Error:", error);
    throw error;
  }

  return ((data ?? []) as ChargeWithJoins[]).map(toChargeWithDetails);
}

export async function listChargesWithPagination(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  params: ChargeQueryParams,
): Promise<PaginatedChargesResponse> {
  const { cursor, pageSize = 20, filters } = params;

  let query = supabase
    .from("psychologist_patient_charges")
    .select(
      `
      *,
      patient:psychologist_patients!psychologist_client_charges_psychologist_patient_id_fkey (
        id,
        patient_id,
        manual_full_name,
        synced_full_name,
        manual_preferred_name,
        manual_first_name,
        manual_last_name,
        manual_phone,
        synced_phone,
        manual_email,
        synced_email
      ),
      session:calendar_events!psychologist_client_charges_session_id_fkey (
        id,
        start_datetime
      )
    `,
      { count: "exact" },
    )
    .eq("psychologist_id", psychologistId)
    .order("created_at", { ascending: false });

  if (filters?.paymentStatus) {
    if (Array.isArray(filters.paymentStatus) && filters.paymentStatus.length > 0) {
      query = query.in("payment_status", filters.paymentStatus);
    } else if (!Array.isArray(filters.paymentStatus)) {
      query = query.eq("payment_status", filters.paymentStatus);
    }
  }

  if (filters?.patientIds && filters.patientIds.length > 0) {
    query = query.in("psychologist_patient_id", filters.patientIds);
  } else if (filters?.patientId) {
    query = query.eq("psychologist_patient_id", filters.patientId);
  }

  if (filters?.startDate) {
    query = query.gte("created_at", filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte("created_at", filters.endDate);
  }

  if (filters?.paymentMethods && filters.paymentMethods.length > 0) {
    query = query.in("payment_method", filters.paymentMethods);
  }

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  query = query.limit(pageSize + 1);

  const { data, error, count } = await query;
  if (error) {
    safeLogger.error("[listChargesWithPagination] Error:", error);
    throw error;
  }

  const charges = (data ?? []) as (ClientCharge & { patient: unknown; session: unknown })[];
  const hasMore = charges.length > pageSize;
  const results = hasMore ? charges.slice(0, pageSize) : charges;
  const lastResult = results[results.length - 1];
  const nextCursor = hasMore && lastResult ? lastResult.created_at : null;

  const transformedResults: ChargeWithRelations[] = results.map((charge) => {
    const sessionData = Array.isArray(charge.session) ? charge.session[0] : charge.session;
    const patientData = Array.isArray(charge.patient) ? charge.patient[0] : charge.patient;
    const row = sessionData as {
      id: string;
      start_datetime: string;
    } | null;

    return {
      ...charge,
      patient: patientData ?? null,
      session: row
        ? {
            id: row.id,
            start_time: row.start_datetime,
            service: null,
          }
        : null,
    };
  });

  return {
    data: transformedResults,
    totalCount: count ?? 0,
    hasMore,
    nextCursor,
  };
}
