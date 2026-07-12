import { err, ok, type Result } from "neverthrow";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  ClinicalSessionStatus,
  CreateSessionInput,
  CreateSessionEventInput,
  MutationResult,
  SessionResult,
  UpdateSessionInput,
} from "@workspace/supabase-data/types/entities";
import {
  AppError,
  AppErrorCode,
  type AppError as AppErrorType,
} from "../../../lib/errors/app-error";
import { userFacingDatabaseErrorMessage } from "../../../utils/error-handler";
import { createPatientSchema, createSessionSchema } from "../../../utils/validation-schemas";
import { resolvePsychologistTimezone } from "../../../utils/timezone";
import { deleteChargeForPsychologist } from "../../charges/application/charge-commands";
import { safeLogger } from "../../../utils/safe-logger";

type TypedSupabaseClient = SupabaseClient<Database>;
type AnyFunction = (...args: unknown[]) => unknown;
type CalendarEventStatusValue = NonNullable<
  Database["public"]["Tables"]["calendar_events"]["Update"]["status"]
>;

function validationError(message: string, details?: Record<string, unknown>): AppErrorType {
  return AppError.validation(AppErrorCode.VALIDATION_INVALID_INPUT, message, details);
}

function infraError(
  message: string,
  cause?: unknown,
  details?: Record<string, unknown>,
): AppErrorType {
  return AppError.infra(AppErrorCode.INFRA_SUPABASE, message, cause, details);
}

function notFound(message: string, resourceType: string, resourceId?: string): AppErrorType {
  return AppError.notFound(AppErrorCode.NOT_FOUND_RESOURCE, message, resourceType, resourceId);
}

/** Session ids now match calendar event ids. */
export async function resolveCalendarEventIdForSession(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  sessionId: string,
): Promise<string | null> {
  const { data: eventRow } = await supabase
    .from("calendar_events")
    .select("id")
    .eq("id", sessionId)
    .eq("psychologist_id", psychologistId)
    .eq("event_type", "session")
    .maybeSingle();

  return eventRow?.id ?? null;
}

async function resolveSessionSnapshot(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  patientId: string,
  serviceId: string,
  customPriceCents?: number,
): Promise<{ priceCents: number | null; serviceName: string | null }> {
  const { data: service } = await supabase
    .from("psychologist_services")
    .select("price, name")
    .eq("id", serviceId)
    .eq("psychologist_id", psychologistId)
    .single();

  const { data: negotiatedPrice } = await supabase
    .from("psychologist_patient_services")
    .select("price_cents")
    .eq("psychologist_id", psychologistId)
    .eq("psychologist_patient_id", patientId)
    .eq("service_id", serviceId)
    .maybeSingle();

  return {
    priceCents: customPriceCents ?? negotiatedPrice?.price_cents ?? service?.price ?? null,
    serviceName: service?.name ?? null,
  };
}

type CreateSessionOccurrenceSummary = {
  sessionId: string;
  eventId: string;
  chargeId?: string;
  noteId?: string;
  detailsId: string;
  status: string;
  effectivePrice: number | null;
};

async function createSessionOccurrenceViaRpc(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  input: {
    patientId: string;
    startTime: string;
    durationMinutes?: number;
    serviceId?: string | null;
    locationId?: string | null;
    notes?: string | null;
    customPriceCents?: number | null;
    status?: ClinicalSessionStatus | null;
    recurrenceRule?: string | null;
    timezone?: string;
    sessionTypeId?: string | null;
    sessionNumber?: number | null;
    title?: string | null;
  },
): Promise<Result<CreateSessionOccurrenceSummary, AppErrorType>> {
  const timezone = await resolvePsychologistTimezone(supabase, psychologistId, input.timezone);

  const rpcClient = supabase as unknown as {
    rpc: (
      fn: string,
      params: Record<string, unknown>,
    ) => Promise<{
      data: unknown;
      error: {
        message: string;
        details?: string | null;
        hint?: string | null;
        code?: string;
      } | null;
    }>;
  };

  const { data, error } = await rpcClient.rpc("create_session_occurrence_atomic", {
    p_psychologist_id: psychologistId,
    p_patient_id: input.patientId,
    ...(input.title !== undefined && input.title !== null ? { p_event_title: input.title } : {}),
    p_start_time: input.startTime,
    p_duration_minutes: input.durationMinutes ?? 50,
    ...(input.serviceId !== undefined && input.serviceId !== null
      ? { p_service_id: input.serviceId }
      : {}),
    ...(input.locationId !== undefined && input.locationId !== null
      ? { p_location_id: input.locationId }
      : {}),
    ...(input.notes !== undefined && input.notes !== null ? { p_notes: input.notes } : {}),
    ...(input.customPriceCents !== undefined && input.customPriceCents !== null
      ? { p_custom_price_cents: input.customPriceCents }
      : {}),
    ...(input.status !== undefined && input.status !== null ? { p_status: input.status } : {}),
    ...(input.recurrenceRule !== undefined && input.recurrenceRule !== null
      ? { p_recurrence_rule: input.recurrenceRule }
      : {}),
    p_timezone: timezone,
    ...(input.sessionTypeId !== undefined && input.sessionTypeId !== null
      ? { p_session_type_id: input.sessionTypeId }
      : {}),
    ...(input.sessionNumber !== undefined && input.sessionNumber !== null
      ? { p_session_number: input.sessionNumber }
      : {}),
  });

  if (error || !data) {
    const raw = error?.message ?? "Erro ao criar sessão. Tente novamente.";
    return err(
      infraError(userFacingDatabaseErrorMessage(raw, error?.code), error, {
        ...(error?.code !== undefined ? { pg_code: error.code } : {}),
      }),
    );
  }

  const result = data as {
    session_id: string;
    event_id: string;
    charge_id?: string;
    note_id?: string;
    details_id?: string;
    status?: string;
    effective_price?: number | null;
  };

  return ok({
    sessionId: result.session_id,
    eventId: result.event_id,
    ...(result.charge_id ? { chargeId: result.charge_id } : {}),
    ...(result.note_id ? { noteId: result.note_id } : {}),
    detailsId: result.details_id ?? result.event_id,
    status: result.status ?? "scheduled",
    effectivePrice: result.effective_price ?? null,
  });
}

export async function createSessionForPsychologist(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  input: CreateSessionInput,
): Promise<Result<SessionResult, AppErrorType>> {
  const normalizedInput: CreateSessionInput = {
    patientId: input.patientId,
    startTime: input.startTime,
    ...(input.durationMinutes !== undefined ? { durationMinutes: input.durationMinutes } : {}),
    ...(input.serviceId !== undefined ? { serviceId: input.serviceId } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    ...(input.recurrenceRule !== undefined ? { recurrenceRule: input.recurrenceRule } : {}),
    ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.paymentStatus !== undefined ? { paymentStatus: input.paymentStatus } : {}),
    ...(input.locationId && input.locationId !== "" ? { locationId: input.locationId } : {}),
    ...(input.customPriceCents !== undefined && input.customPriceCents > 0
      ? { customPriceCents: input.customPriceCents }
      : {}),
  };

  const validation = createSessionSchema.safeParse(normalizedInput);
  if (!validation.success) {
    return err(validationError(validation.error.issues[0]?.message ?? "Dados inválidos"));
  }

  const validatedInput = validation.data;
  const result = await createSessionOccurrenceViaRpc(supabase, psychologistId, {
    patientId: validatedInput.patientId,
    startTime: validatedInput.startTime,
    ...(validatedInput.durationMinutes !== undefined
      ? { durationMinutes: validatedInput.durationMinutes }
      : {}),
    ...(validatedInput.serviceId !== undefined ? { serviceId: validatedInput.serviceId } : {}),
    ...(validatedInput.locationId !== undefined ? { locationId: validatedInput.locationId } : {}),
    ...(validatedInput.notes !== undefined ? { notes: validatedInput.notes } : {}),
    ...(validatedInput.customPriceCents !== undefined
      ? { customPriceCents: validatedInput.customPriceCents }
      : {}),
    ...(validatedInput.status !== undefined ? { status: validatedInput.status } : {}),
    ...(validatedInput.recurrenceRule !== undefined
      ? { recurrenceRule: validatedInput.recurrenceRule }
      : {}),
    ...(validatedInput.timezone !== undefined ? { timezone: validatedInput.timezone } : {}),
  });

  if (result.isErr()) {
    return err(result.error);
  }

  return ok({
    id: result.value.sessionId,
    status: result.value.status as "scheduled" | "open",
  });
}

export async function createSessionFromCalendarEventForPsychologist(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  input: CreateSessionEventInput,
): Promise<
  Result<
    {
      session_id: string;
      event_id: string;
      charge_id?: string;
      note_id?: string;
      details_id: string;
    },
    AppErrorType
  >
> {
  const sessionStatus: "scheduled" | "completed" | "cancelled" | null =
    input.status === "scheduled" || input.status === "completed" || input.status === "cancelled"
      ? input.status
      : null;

  const result = await createSessionOccurrenceViaRpc(supabase, psychologistId, {
    patientId: input.patientId,
    ...(input.title !== undefined ? { title: input.title } : {}),
    startTime: input.startDatetime,
    ...(input.durationMinutes !== undefined ? { durationMinutes: input.durationMinutes } : {}),
    ...(input.serviceId !== undefined && input.serviceId !== null
      ? { serviceId: input.serviceId }
      : {}),
    ...(input.locationId !== undefined && input.locationId !== null
      ? { locationId: input.locationId }
      : {}),
    ...(input.notes !== undefined && input.notes !== null
      ? { notes: input.notes }
      : input.description !== undefined && input.description !== null
        ? { notes: input.description }
        : {}),
    ...(input.price !== undefined && input.price !== null ? { customPriceCents: input.price } : {}),
    ...(sessionStatus !== null ? { status: sessionStatus } : {}),
    ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
    ...(input.sessionTypeId !== undefined && input.sessionTypeId !== null
      ? { sessionTypeId: input.sessionTypeId }
      : {}),
    ...(input.sessionNumber !== undefined && input.sessionNumber !== null
      ? { sessionNumber: input.sessionNumber }
      : {}),
  });

  if (result.isErr()) {
    return err(result.error);
  }

  return ok({
    session_id: result.value.sessionId,
    event_id: result.value.eventId,
    ...(result.value.chargeId ? { charge_id: result.value.chargeId } : {}),
    ...(result.value.noteId ? { note_id: result.value.noteId } : {}),
    details_id: result.value.detailsId,
  });
}

export async function updateSessionForPsychologist(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  sessionId: string,
  input: UpdateSessionInput,
): Promise<Result<MutationResult, AppErrorType>> {
  const needsSnapshotRefresh =
    input.serviceId !== undefined || input.customPriceCents !== undefined;

  const { data: currentSession, error: currentSessionError } = await supabase
    .from("therapeutic_session_events")
    .select(
      "calendar_event_id, clinical_session_id, start_datetime, duration_minutes, psychologist_patient_id",
    )
    .or(`calendar_event_id.eq.${sessionId},clinical_session_id.eq.${sessionId}`)
    .eq("psychologist_id", psychologistId)
    .single();

  if (currentSessionError || !currentSession) {
    return err(notFound("Sessão não encontrada", "session", sessionId));
  }

  if (!currentSession.start_datetime) {
    return err(validationError("Sessão sem horário inicial."));
  }

  const now = new Date().toISOString();
  const calendarEventId = currentSession.calendar_event_id ?? sessionId;
  const clinicalSessionId = currentSession.clinical_session_id ?? sessionId;
  const updateData: Database["public"]["Tables"]["calendar_events"]["Update"] = {
    updated_at: now,
  };
  const detailsUpdate: Database["public"]["Tables"]["psychologist_clinical_sessions"]["Update"] = {
    updated_at: now,
    updated_by: psychologistId,
  };

  let sessionPatientId: string | null = null;
  if (needsSnapshotRefresh) {
    sessionPatientId = currentSession.psychologist_patient_id;
  }

  const nextStartTime = input.startTime ?? currentSession.start_datetime;
  const nextDuration = input.durationMinutes ?? currentSession.duration_minutes ?? 50;
  updateData.start_datetime = nextStartTime;
  updateData.end_datetime = new Date(
    new Date(nextStartTime).getTime() + nextDuration * 60_000,
  ).toISOString();
  if (input.durationMinutes !== undefined) {
    updateData.duration_minutes = input.durationMinutes;
  }
  if (input.serviceId !== undefined) {
    detailsUpdate.psychologist_service_id = input.serviceId;

    if (input.serviceId && sessionPatientId) {
      const snapshot = await resolveSessionSnapshot(
        supabase,
        psychologistId,
        sessionPatientId,
        input.serviceId,
        input.customPriceCents,
      );
      detailsUpdate.snapshot_price_cents = snapshot.priceCents;
      detailsUpdate.snapshot_service_name = snapshot.serviceName;
    }
  }
  if (input.customPriceCents !== undefined) {
    detailsUpdate.snapshot_price_cents = input.customPriceCents;
    detailsUpdate.custom_price_cents = input.customPriceCents;
  }
  if (input.locationId !== undefined) {
    detailsUpdate.location_id = input.locationId;
  }
  if (input.notes !== undefined) {
    detailsUpdate.notes = input.notes;
  }
  detailsUpdate.start_time = nextStartTime;
  detailsUpdate.duration_minutes = nextDuration;

  const { error } = await supabase
    .from("calendar_events")
    .update(updateData)
    .eq("id", calendarEventId)
    .eq("psychologist_id", psychologistId)
    .eq("event_type", "session");

  if (error) {
    return err(infraError("Erro ao atualizar sessão. Tente novamente.", error));
  }

  const { error: detailsError } = await supabase
    .from("psychologist_clinical_sessions")
    .update(detailsUpdate)
    .eq("id", clinicalSessionId)
    .eq("psychologist_id", psychologistId);

  if (detailsError) {
    return err(infraError("Erro ao atualizar detalhes da sessão. Tente novamente.", detailsError));
  }

  return ok({ success: true });
}

export async function rescheduleSessionForPsychologist(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  sessionId: string,
  newStartTime: string,
  newDurationMinutes?: number,
  reason?: string,
): Promise<Result<MutationResult, AppErrorType>> {
  const { data: session, error: fetchError } = await supabase
    .from("calendar_events")
    .select("start_datetime, duration_minutes")
    .eq("id", sessionId)
    .eq("psychologist_id", psychologistId)
    .eq("event_type", "session")
    .single();

  if (fetchError || !session) {
    return err(notFound("Sessão não encontrada", "session", sessionId));
  }

  const { error: logError } = await supabase.from("session_reschedule_logs").insert({
    session_id: sessionId,
    from_start_time: session.start_datetime,
    to_start_time: newStartTime,
    from_duration_minutes: session.duration_minutes,
    to_duration_minutes: newDurationMinutes ?? session.duration_minutes,
    reason: reason ?? null,
    created_by: psychologistId,
    created_at: new Date().toISOString(),
  });

  if (logError) {
    safeLogger.error("[rescheduleSessionForPsychologist] Log error:", logError);
  }

  const updateData: Database["public"]["Tables"]["calendar_events"]["Update"] = {
    start_datetime: newStartTime,
    end_datetime: new Date(
      new Date(newStartTime).getTime() + (newDurationMinutes ?? session.duration_minutes) * 60_000,
    ).toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (newDurationMinutes !== undefined) {
    updateData.duration_minutes = newDurationMinutes;
  }

  const { error } = await supabase
    .from("calendar_events")
    .update(updateData)
    .eq("id", sessionId)
    .eq("psychologist_id", psychologistId)
    .eq("event_type", "session");

  if (error) {
    return err(infraError("Erro ao reagendar sessão. Tente novamente.", error));
  }

  const { error: detailsError } = await supabase
    .from("psychologist_clinical_sessions")
    .update({
      start_time: newStartTime,
      duration_minutes: newDurationMinutes ?? session.duration_minutes,
      status: "rescheduled",
      status_reason: reason ?? null,
      updated_at: new Date().toISOString(),
      updated_by: psychologistId,
    })
    .eq("calendar_event_id", sessionId)
    .eq("psychologist_id", psychologistId);

  if (detailsError) {
    return err(infraError("Erro ao atualizar detalhes do reagendamento.", detailsError));
  }

  return ok({ success: true });
}

export async function completeSessionForPsychologist(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  sessionId: string,
): Promise<Result<MutationResult, AppErrorType>> {
  const { error } = await supabase
    .from("calendar_events")
    .update({
      status: "completed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("psychologist_id", psychologistId)
    .eq("event_type", "session");

  if (error) {
    return err(infraError("Erro ao marcar sessão como realizada. Tente novamente.", error));
  }

  await supabase
    .from("psychologist_clinical_sessions")
    .update({
      status: "completed",
      updated_at: new Date().toISOString(),
      updated_by: psychologistId,
    })
    .eq("calendar_event_id", sessionId)
    .eq("psychologist_id", psychologistId);

  const { data: session } = await supabase
    .from("therapeutic_session_events")
    .select("psychologist_patient_id, start_datetime")
    .or(`calendar_event_id.eq.${sessionId},clinical_session_id.eq.${sessionId}`)
    .eq("psychologist_id", psychologistId)
    .single();

  if (session?.psychologist_patient_id) {
    const { data: patient } = await supabase
      .from("psychologist_patients")
      .select("total_sessions_count")
      .eq("id", session.psychologist_patient_id)
      .single();

    await supabase
      .from("psychologist_patients")
      .update({
        last_session_date: session.start_datetime?.split("T")[0] ?? null,
        total_sessions_count: (patient?.total_sessions_count ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.psychologist_patient_id);
  }

  return ok({ success: true });
}

export async function cancelSessionForPsychologist(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  sessionId: string,
  reason?: string,
): Promise<Result<MutationResult, AppErrorType>> {
  const calendarEventId = await resolveCalendarEventIdForSession(
    supabase,
    psychologistId,
    sessionId,
  );

  if (calendarEventId) {
    const { error: calendarError } = await supabase
      .from("calendar_events")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", calendarEventId)
      .eq("psychologist_id", psychologistId);

    if (calendarError) {
      return err(
        infraError("Erro ao cancelar evento no calendário. Tente novamente.", calendarError),
      );
    }
  }

  const { error } = await supabase
    .from("calendar_events")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("psychologist_id", psychologistId)
    .eq("event_type", "session");

  if (error) {
    return err(infraError("Erro ao cancelar sessão. Tente novamente.", error));
  }

  await supabase
    .from("psychologist_clinical_sessions")
    .update({
      status: "cancelled",
      status_reason: reason ?? null,
      updated_at: new Date().toISOString(),
      updated_by: psychologistId,
    })
    .or(`id.eq.${sessionId},calendar_event_id.eq.${sessionId}`)
    .eq("psychologist_id", psychologistId);

  return ok({ success: true });
}

export async function markSessionNoShowForPsychologist(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  sessionId: string,
  reason?: string,
): Promise<Result<MutationResult, AppErrorType>> {
  const { error } = await supabase
    .from("calendar_events")
    .update({
      status: "no_show",
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("psychologist_id", psychologistId)
    .eq("event_type", "session");

  if (error) {
    return err(infraError("Erro ao marcar falta. Tente novamente.", error));
  }

  await supabase
    .from("psychologist_clinical_sessions")
    .update({
      status: "no_show",
      status_reason: reason ?? null,
      updated_at: new Date().toISOString(),
      updated_by: psychologistId,
    })
    .or(`id.eq.${sessionId},calendar_event_id.eq.${sessionId}`)
    .eq("psychologist_id", psychologistId);

  return ok({ success: true });
}

export async function changeSessionStatusForPsychologist(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  sessionId: string,
  status: ClinicalSessionStatus,
  reason?: string,
): Promise<Result<MutationResult, AppErrorType>> {
  const { error } = await supabase
    .from("calendar_events")
    .update({
      status: (status === "open" ? "scheduled" : status) as CalendarEventStatusValue,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("psychologist_id", psychologistId)
    .eq("event_type", "session");

  if (error) {
    return err(infraError("Erro ao alterar status. Tente novamente.", error));
  }

  await supabase
    .from("psychologist_clinical_sessions")
    .update({
      status,
      status_reason: reason ?? null,
      updated_at: new Date().toISOString(),
      updated_by: psychologistId,
    })
    .or(`id.eq.${sessionId},calendar_event_id.eq.${sessionId}`)
    .eq("psychologist_id", psychologistId);

  return ok({ success: true });
}

export async function deleteSessionForPsychologist(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  sessionId: string,
): Promise<Result<MutationResult, AppErrorType>> {
  const { data: session, error: fetchError } = await supabase
    .from("calendar_events")
    .select("id,status")
    .eq("id", sessionId)
    .eq("psychologist_id", psychologistId)
    .eq("event_type", "session")
    .single();

  if (fetchError || !session) {
    return err(notFound("Sessão não encontrada", "session", sessionId));
  }

  if (session.status !== "scheduled" && session.status !== "cancelled") {
    return err(validationError("Apenas sessões agendadas ou canceladas podem ser excluídas."));
  }

  const { data: charge } = await supabase
    .from("psychologist_patient_charges")
    .select("id")
    .eq("session_id", session.id)
    .eq("psychologist_id", psychologistId)
    .maybeSingle();

  if (charge?.id) {
    const chargeResult = await deleteChargeForPsychologist(
      supabase,
      psychologistId,
      charge.id,
    );

    if (chargeResult.isErr()) {
      safeLogger.error("[deleteSessionForPsychologist] Error deleting charge:", chargeResult.error);
    }
  }

  const { error: noteError } = await supabase
    .from("psychologist_notes")
    .delete()
    .eq("session_id", session.id)
    .eq("psychologist_id", psychologistId);

  if (noteError) {
    safeLogger.error("[deleteSessionForPsychologist] Error deleting note:", noteError);
  }

  const { error } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", sessionId)
    .eq("psychologist_id", psychologistId)
    .eq("event_type", "session");

  if (error) {
    return err(infraError("Erro ao excluir sessão. Tente novamente.", error));
  }

  return ok({ success: true });
}

const bookPublicSessionSchema = z
  .object({
    psychologistId: z.uuid(),
    patient: createPatientSchema
      .extend({
        fullName: z.string().min(2, "Nome é obrigatório"),
        email: z.string().email("Email obrigatório"),
        phone: z.string().min(8, "Telefone obrigatório"),
      })
      .optional(),
    patientId: z.uuid().optional(),
    startTime: z.string().datetime(),
    serviceId: z.uuid().optional(),
    locationId: z.uuid().optional(),
    durationMinutes: z.number().int().positive().optional(),
    timezone: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => data.patient || data.patientId, {
    message: "Dados do paciente são obrigatórios",
    path: ["patient"],
  });

export type BookPublicSessionInput = z.infer<typeof bookPublicSessionSchema>;

function createEmptyEditorStateBase64(): string {
  const emptyState = {
    root: {
      children: [
        {
          children: [],
          direction: null,
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
          textFormat: 0,
          textStyle: "",
        },
      ],
      direction: null,
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };

  return Buffer.from(JSON.stringify(emptyState)).toString("base64");
}

export async function bookPublicSession(
  supabase: TypedSupabaseClient,
  input: BookPublicSessionInput,
): Promise<Result<SessionResult, AppErrorType>> {
  const validation = bookPublicSessionSchema.safeParse(input);
  if (!validation.success) {
    return err(
      validationError(validation.error.issues[0]?.message ?? "Dados do agendamento inválidos"),
    );
  }

  const {
    psychologistId,
    patient: patientDetails,
    patientId: existingPatientId,
    startTime,
    serviceId,
    locationId,
    durationMinutes,
    timezone,
    notes,
  } = validation.data;

  let patientId = existingPatientId;

  if (!patientId && patientDetails) {
    const emailToMatch =
      patientDetails.email?.trim() ||
      (typeof patientDetails.email === "string" ? patientDetails.email : "");

    const { data: existingPatient } = await supabase
      .from("psychologist_patients")
      .select("id")
      .eq("psychologist_id", psychologistId)
      .or(`manual_email.eq.${emailToMatch},synced_email.eq.${emailToMatch}`)
      .maybeSingle();

    if (existingPatient) {
      patientId = existingPatient.id;
    } else {
      const firstName =
        patientDetails.first_name?.trim() || patientDetails.fullName?.trim()?.split(/\s+/)[0] || "";
      const lastName =
        patientDetails.last_name?.trim() ||
        patientDetails.fullName?.trim()?.split(/\s+/).slice(1).join(" ") ||
        null;

      const { data: newPatient, error: createError } = await supabase
        .from("psychologist_patients")
        .insert({
          psychologist_id: psychologistId,
          manual_first_name: firstName,
          manual_last_name: lastName,
          manual_full_name: patientDetails.fullName ?? null,
          manual_email: patientDetails.email?.trim() ?? null,
          manual_phone: patientDetails.phone?.trim() ?? null,
          manual_cpf: patientDetails.cpf?.trim() ?? null,
          manual_date_of_birth: patientDetails.date_of_birth?.trim() ?? null,
          status: "active",
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (createError) {
        return err(infraError("Erro ao cadastrar paciente.", createError));
      }

      patientId = newPatient.id;
    }
  }

  if (!patientId) {
    return err(validationError("Erro ao identificar paciente."));
  }

  const sessionResult = await createSessionOccurrenceViaRpc(supabase, psychologistId, {
    patientId,
    startTime,
    ...(durationMinutes !== undefined ? { durationMinutes } : {}),
    ...(serviceId !== undefined ? { serviceId } : {}),
    ...(locationId !== undefined ? { locationId } : {}),
    notes: notes ?? "Agendamento online",
    status: "scheduled",
    ...(timezone !== undefined ? { timezone } : {}),
    title: `Sessão - ${patientDetails?.fullName ?? "Paciente"}`,
  });

  if (sessionResult.isErr()) {
    return err(sessionResult.error);
  }

  const session = sessionResult.value;

  const encodedContent = createEmptyEditorStateBase64();
  const { data: noteData } = await supabase
    .from("psychologist_notes")
    .insert({
      psychologist_id: psychologistId,
      patient_id: patientId,
      session_id: session.eventId,
      note_type: "clinical_note",
      encoded_content: encodedContent,
      title: "Nota da Sessão",
      is_archived: false,
      created_at: new Date().toISOString(),
      created_by: psychologistId,
    })
    .select("id")
    .single();

  if (noteData) {
    await supabase
      .from("psychologist_clinical_sessions")
      .update({ note_id: noteData.id })
      .eq("id", session.sessionId);
  }

  return ok({ id: session.eventId, status: "scheduled" });
}
