import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  ClinicalSession,
  ClinicalSessionStatus,
  PaymentStatus,
  SessionFilters,
  SessionRescheduleLog,
  SessionRescheduleRequest,
  SessionWithDetails,
} from "@workspace/supabase-data/types/entities";
import { normalizeTimezone } from "../../../utils/timezone";
import { safeLogger } from "../../../utils/safe-logger";

type TypedSupabaseClient = SupabaseClient<Database>;
type SessionRow = Database["public"]["Views"]["therapeutic_session_events"]["Row"];
type NormalizedSessionRow = SessionRow & {
  id: string;
  psychologist_id: string;
  start_time: string;
  duration_minutes: number;
  status: ClinicalSessionStatus;
  source: NonNullable<SessionRow["source"]>;
  title: string;
  timezone: string;
  location_id: string | null;
  default_charge_id: string | null;
  snapshot_price_cents: number | null;
  snapshot_service_name: string | null;
  notes: string | null;
};

type PatientLookup = {
  manual_display_name: string | null;
  manual_full_name: string | null;
  manual_preferred_name: string | null;
  manual_first_name: string | null;
  manual_last_name: string | null;
  synced_display_name: string | null;
  synced_full_name: string | null;
};

type ServiceLookup = {
  name: string | null;
};

type LocationLookup = {
  name: string | null;
};

type ChargeLookup = {
  id: string;
  price_cents: number | null;
  payment_status: PaymentStatus | null;
  due_date: string | null;
};

type SessionRelations = {
  patients: Map<string, PatientLookup>;
  services: Map<string, ServiceLookup>;
  locations: Map<string, LocationLookup>;
  charges: Map<string, ChargeLookup>;
};

function isNonEmptyString(value: string | null): value is string {
  return typeof value === "string" && value.length > 0;
}

function getDateKeyInTimezone(date: Date, timezone?: string): string {
  const resolvedTimezone = normalizeTimezone(timezone);
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: resolvedTimezone,
    year: "numeric",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

function isToday(dateStr: string | null, timezone?: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return getDateKeyInTimezone(date, timezone) === getDateKeyInTimezone(new Date(), timezone);
}

function isPast(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function computeSessionStatus(
  currentStatus: ClinicalSessionStatus,
  startTime: string | null,
): ClinicalSessionStatus {
  const status = (currentStatus ?? "scheduled") as ClinicalSessionStatus;
  const finalStates: ClinicalSessionStatus[] = ["completed", "cancelled", "no_show"];
  if (finalStates.includes(status)) {
    return status;
  }

  if (status === "scheduled" && isPast(startTime)) {
    return "open";
  }

  return status;
}

function buildPatientName(patient: PatientLookup | undefined): string {
  if (!patient) return "Paciente";
  return (
    patient.manual_display_name ??
    patient.synced_display_name ??
    patient.manual_preferred_name ??
    patient.manual_full_name ??
    patient.synced_full_name ??
    [patient.manual_first_name, patient.manual_last_name].filter(Boolean).join(" ").trim() ??
    "Paciente"
  );
}

function normalizeSessionRow(session: SessionRow): NormalizedSessionRow | null {
  const id = session.clinical_session_id ?? session.calendar_event_id;
  const startTime = session.start_datetime;
  const status = session.scheduling_status;
  const source = session.source;
  const title = session.title ?? session.service_name ?? "Sessao";
  const timezone = session.timezone;

  return (
    isNonEmptyString(id) &&
    isNonEmptyString(session.psychologist_id) &&
    isNonEmptyString(startTime) &&
    typeof session.duration_minutes === "number" &&
    isNonEmptyString(status) &&
    isNonEmptyString(source) &&
    isNonEmptyString(timezone)
  )
    ? {
        ...session,
        id,
        psychologist_id: session.psychologist_id,
        start_time: startTime,
        duration_minutes: session.duration_minutes,
        status,
        source,
        title,
        timezone,
        location_id: null,
        default_charge_id: null,
        snapshot_price_cents: session.service_price,
        snapshot_service_name: session.service_name,
        notes: session.private_notes,
      }
    : null;
}

function normalizeSessionRows(
  sessions: readonly SessionRow[],
  logLabel: string,
): NormalizedSessionRow[] {
  const normalizedSessions = sessions
    .map((session) => normalizeSessionRow(session))
    .filter((session): session is NormalizedSessionRow => Boolean(session));

  if (normalizedSessions.length !== sessions.length) {
    safeLogger.warn(
      `[${logLabel}] Skipped ${sessions.length - normalizedSessions.length} malformed therapeutic_session_events rows`,
    );
  }

  return normalizedSessions;
}

async function loadSessionRelations(
  supabase: TypedSupabaseClient,
  sessions: readonly NormalizedSessionRow[],
): Promise<SessionRelations> {
  const patientIds = [
    ...new Set(sessions.map((session) => session.psychologist_patient_id).filter(isNonEmptyString)),
  ];
  const serviceIds = [
    ...new Set(sessions.map((session) => session.psychologist_service_id).filter(isNonEmptyString)),
  ];
  const locationIds = [
    ...new Set(sessions.map((session) => session.location_id).filter(isNonEmptyString)),
  ];
  const chargeIds = [
    ...new Set(sessions.map((session) => session.default_charge_id).filter(isNonEmptyString)),
  ];

  const [patientsResult, servicesResult, locationsResult, chargesResult] = await Promise.all([
    patientIds.length > 0
      ? supabase
          .from("psychologist_patients")
          .select("id, manual_display_name, synced_display_name, manual_full_name, synced_full_name, manual_preferred_name, manual_first_name, manual_last_name")
          .in("id", patientIds)
      : Promise.resolve({ data: [], error: null }),
    serviceIds.length > 0
      ? supabase.from("psychologist_services").select("id, name").in("id", serviceIds)
      : Promise.resolve({ data: [], error: null }),
    locationIds.length > 0
      ? supabase.from("public_locations").select("id, name").in("id", locationIds)
      : Promise.resolve({ data: [], error: null }),
    chargeIds.length > 0
      ? supabase
          .from("psychologist_patient_charges")
          .select("id, price_cents, payment_status, due_date")
          .in("id", chargeIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (patientsResult.error) throw patientsResult.error;
  if (servicesResult.error) throw servicesResult.error;
  if (locationsResult.error) throw locationsResult.error;
  if (chargesResult.error) throw chargesResult.error;

  return {
    patients: new Map((patientsResult.data ?? []).map((row) => [row.id, row])),
    services: new Map((servicesResult.data ?? []).map((row) => [row.id, row])),
    locations: new Map((locationsResult.data ?? []).map((row) => [row.id, row])),
    charges: new Map(
      (chargesResult.data ?? []).map((row) => [
        row.id,
        {
          ...row,
          payment_status: row.payment_status as PaymentStatus | null,
        },
      ]),
    ),
  };
}

function enrichSession(
  session: NormalizedSessionRow,
  relations: SessionRelations,
  timezone?: string,
): SessionWithDetails {
  const patient = session.psychologist_patient_id
    ? relations.patients.get(session.psychologist_patient_id)
    : undefined;
  const service = session.psychologist_service_id
    ? relations.services.get(session.psychologist_service_id)
    : undefined;
  const location = session.location_id ? relations.locations.get(session.location_id) : undefined;
  const chargeData = session.default_charge_id
    ? relations.charges.get(session.default_charge_id)
    : undefined;

  const patientName = session.patient_display_name ?? session.patient_name ?? buildPatientName(patient);
  const serviceName = session.snapshot_service_name ?? service?.name ?? null;
  const locationName = location?.name ?? null;
  const sessionTimezone = normalizeTimezone(timezone);

  return {
    ...session,
    status: computeSessionStatus(session.status, session.start_time),
    patientName,
    serviceName,
    price: session.snapshot_price_cents ?? null,
    locationName,
    isPast: isPast(session.start_time),
    isToday: isToday(session.start_time, sessionTimezone),
    charge: chargeData
      ? {
          id: chargeData.id,
          price_cents: chargeData.price_cents,
          payment_status: chargeData.payment_status,
          due_date: chargeData.due_date,
        }
      : null,
  };
}

async function fetchSessionList(
  supabase: TypedSupabaseClient,
  query: PromiseLike<{ data: SessionRow[] | null; error: unknown }>,
  timezone?: string,
  logLabel = "fetchSessionList",
): Promise<SessionWithDetails[]> {
  const { data, error } = await query;

  if (error) {
    safeLogger.error(`[${logLabel}] Error:`, error);
    throw error;
  }

  const sessions = data ?? [];
  const normalizedSessions = normalizeSessionRows(sessions, logLabel);
  const relations = await loadSessionRelations(supabase, normalizedSessions);
  return normalizedSessions.map((session) => enrichSession(session, relations, timezone));
}

export async function listPsychologistClinicalSessions(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  filters?: SessionFilters,
  timezone?: string,
): Promise<SessionWithDetails[]> {
  let query = supabase
    .from("therapeutic_session_events")
    .select("*")
    .eq("psychologist_id", psychologistId)
    .order("start_datetime", { ascending: false });

  if (filters?.status && filters.status !== "open") query = query.eq("scheduling_status", filters.status);
  if (filters?.patientId) query = query.eq("psychologist_patient_id", filters.patientId);
  if (filters?.startDate) query = query.gte("start_datetime", filters.startDate);
  if (filters?.endDate) query = query.lte("start_datetime", filters.endDate);
  if (filters?.limit) query = query.limit(filters.limit);
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit ?? 20) - 1);
  }

  return fetchSessionList(supabase, query, timezone, "listPsychologistClinicalSessions");
}

export async function getPsychologistClinicalSessionDetails(
  supabase: TypedSupabaseClient,
  sessionId: string,
  timezone?: string,
): Promise<SessionWithDetails | null> {
  const { data, error } = await supabase
    .from("therapeutic_session_events")
    .select("*")
      .or(`clinical_session_id.eq.${sessionId},calendar_event_id.eq.${sessionId}`)
    .maybeSingle();

  if (error) {
    safeLogger.error("[getPsychologistClinicalSessionDetails] Error:", error);
    throw error;
  }

  const [session] = normalizeSessionRows(
    data ? [data] : [],
    "getPsychologistClinicalSessionDetails",
  );

  if (!session) return null;

  const relations = await loadSessionRelations(supabase, [session]);
  return enrichSession(session, relations, timezone);
}

export async function listUpcomingSessions(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  limit = 10,
  timezone?: string,
): Promise<SessionWithDetails[]> {
  const now = new Date().toISOString();
  const query = supabase
    .from("therapeutic_session_events")
    .select("*")
    .eq("psychologist_id", psychologistId)
    .gte("start_datetime", now)
    .in("scheduling_status", ["scheduled", "confirmed"])
    .order("start_datetime", { ascending: true })
    .limit(limit);

  return fetchSessionList(supabase, query, timezone, "listUpcomingSessions");
}

export async function listPatientSessions(
  supabase: TypedSupabaseClient,
  patientId: string,
  limit = 50,
  timezone?: string,
): Promise<SessionWithDetails[]> {
  const query = supabase
    .from("therapeutic_session_events")
    .select("*")
    .eq("psychologist_patient_id", patientId)
    .order("start_datetime", { ascending: false })
    .limit(limit);

  return fetchSessionList(supabase, query, timezone, "listPatientSessions");
}

export async function listPatientDashboardSessions(
  supabase: TypedSupabaseClient,
  limit = 50,
  timezone?: string,
  userId?: string,
): Promise<SessionWithDetails[]> {
  let targetUserId = userId;
  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    targetUserId = user.id;
  }

  const query = supabase
    .from("therapeutic_session_events")
    .select("*")
    .eq("psychologist_id", targetUserId)
    .order("start_datetime", { ascending: false })
    .limit(limit);

  return fetchSessionList(supabase, query, timezone, "listPatientDashboardSessions");
}

export async function listTodaySessions(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  timezone?: string,
): Promise<SessionWithDetails[]> {
  const resolvedTimezone = normalizeTimezone(timezone);
  const now = new Date();
  const startWindow = new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString();
  const endWindow = new Date(now.getTime() + 36 * 60 * 60 * 1000).toISOString();

  const sessions = await fetchSessionList(
    supabase,
    supabase
      .from("therapeutic_session_events")
      .select("*")
      .eq("psychologist_id", psychologistId)
      .gte("start_datetime", startWindow)
      .lte("start_datetime", endWindow)
      .order("start_datetime", { ascending: true }),
    resolvedTimezone,
    "listTodaySessions",
  );

  return sessions.filter((session) => session.isToday);
}

export async function getOldestOpenSession(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  timezone?: string,
): Promise<SessionWithDetails | null> {
  const { data, error } = await supabase
    .from("therapeutic_session_events")
    .select("*")
    .eq("psychologist_id", psychologistId)
    .in("scheduling_status", ["scheduled", "confirmed"])
    .order("start_datetime", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    safeLogger.error("[getOldestOpenSession] Error:", error);
    throw error;
  }

  const [sessionRow] = normalizeSessionRows(data ? [data] : [], "getOldestOpenSession");

  if (!sessionRow) return null;

  const relations = await loadSessionRelations(supabase, [sessionRow]);
  const session = enrichSession(sessionRow, relations, timezone);
  return session;
}

export async function getEventMeetLink(
  supabase: TypedSupabaseClient,
  eventId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("calendar_events")
    .select("metadata")
    .eq("id", eventId)
    .single();

  if (error) {
    safeLogger.error("[getEventMeetLink] Error:", error);
    throw error;
  }

  const metadata = data?.metadata as Record<string, unknown> | null;
  const meetLink = metadata?.google_meet_link ?? metadata?.meet_link;
  return typeof meetLink === "string" ? meetLink : null;
}

export async function listSessionRescheduleRequests(
  supabase: TypedSupabaseClient,
  sessionId: string,
): Promise<SessionRescheduleRequest[]> {
  const { data, error } = await supabase
    .from("session_reschedule_requests")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) {
    safeLogger.error("[listSessionRescheduleRequests] Error:", error);
    throw error;
  }

  return data ?? [];
}

export async function listSessionRescheduleLogs(
  supabase: TypedSupabaseClient,
  sessionId: string,
): Promise<SessionRescheduleLog[]> {
  const { data, error } = await supabase
    .from("session_reschedule_logs")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) {
    safeLogger.error("[listSessionRescheduleLogs] Error:", error);
    throw error;
  }

  return data ?? [];
}

export async function getSessionCount(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  filters?: { startDate?: string; endDate?: string; status?: ClinicalSession["status"] },
): Promise<number> {
  let query = supabase
    .from("therapeutic_session_events")
    .select("id", { count: "exact", head: true })
    .eq("psychologist_id", psychologistId);

  if (filters?.status && filters.status !== "open") {
    query = query.eq("scheduling_status", filters.status);
  }
  if (filters?.startDate) query = query.gte("start_datetime", filters.startDate);
  if (filters?.endDate) query = query.lte("start_datetime", filters.endDate);

  const { count, error } = await query;
  if (error) {
    safeLogger.error("[getSessionCount] Error:", error);
    throw error;
  }

  return count ?? 0;
}
