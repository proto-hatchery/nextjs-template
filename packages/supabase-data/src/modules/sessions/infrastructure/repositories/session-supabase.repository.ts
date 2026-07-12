import type { SupabaseClient } from "@supabase/supabase-js";
import { err, ok, type Result } from "neverthrow";
import {
  AppError,
  AppErrorCode,
  type AppError as AppErrorType,
  toAppError,
} from "../../../../lib/errors/app-error";
import {
  getEventMeetLink,
  getOldestOpenSession,
  getPsychologistClinicalSessionDetails,
  listPatientDashboardSessions,
  listPatientSessions,
  listPsychologistClinicalSessions,
  listTodaySessions,
  listUpcomingSessions,
} from "../../application/session-queries";
import type { Database } from "@workspace/supabase-infra/types/database";
import type { SessionFilters, SessionWithDetails } from "@workspace/supabase-data/types/entities";
import type { SessionRepository } from "../../domain/ports/session-repository.port";

export class SessionSupabaseRepository implements SessionRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listPsychologistSessions(
    psychologistId: string,
    filters?: SessionFilters,
    timezone?: string,
  ): Promise<Result<SessionWithDetails[], AppErrorType>> {
    try {
      return ok(
        await listPsychologistClinicalSessions(this.supabase, psychologistId, filters, timezone),
      );
    } catch (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to fetch psychologist clinical sessions",
          toAppError(error),
        ),
      );
    }
  }

  async getSessionDetails(
    sessionId: string,
    timezone?: string,
  ): Promise<Result<SessionWithDetails | null, AppErrorType>> {
    try {
      return ok(await getPsychologistClinicalSessionDetails(this.supabase, sessionId, timezone));
    } catch (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to fetch clinical session details",
          toAppError(error),
        ),
      );
    }
  }

  async listUpcomingSessions(
    psychologistId: string,
    limit = 10,
    timezone?: string,
  ): Promise<Result<SessionWithDetails[], AppErrorType>> {
    try {
      return ok(await listUpcomingSessions(this.supabase, psychologistId, limit, timezone));
    } catch (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to fetch upcoming sessions",
          toAppError(error),
        ),
      );
    }
  }

  async listPatientSessions(
    patientId: string,
    limit = 50,
    timezone?: string,
  ): Promise<Result<SessionWithDetails[], AppErrorType>> {
    try {
      return ok(await listPatientSessions(this.supabase, patientId, limit, timezone));
    } catch (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to fetch patient sessions",
          toAppError(error),
        ),
      );
    }
  }

  async listTodaySessions(
    psychologistId: string,
    timezone?: string,
  ): Promise<Result<SessionWithDetails[], AppErrorType>> {
    try {
      return ok(await listTodaySessions(this.supabase, psychologistId, timezone));
    } catch (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to fetch today's sessions",
          toAppError(error),
        ),
      );
    }
  }

  async getOldestOpenSession(
    psychologistId: string,
    timezone?: string,
  ): Promise<Result<SessionWithDetails | null, AppErrorType>> {
    try {
      return ok(await getOldestOpenSession(this.supabase, psychologistId, timezone));
    } catch (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to fetch oldest open session",
          toAppError(error),
        ),
      );
    }
  }

  async listPatientDashboardSessions(
    limit = 50,
    timezone?: string,
    userId?: string,
  ): Promise<Result<SessionWithDetails[], AppErrorType>> {
    try {
      return ok(await listPatientDashboardSessions(this.supabase, limit, timezone, userId));
    } catch (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to fetch patient dashboard sessions",
          toAppError(error),
        ),
      );
    }
  }

  async getEventMeetLink(eventId: string): Promise<Result<string | null, AppErrorType>> {
    try {
      return ok(await getEventMeetLink(this.supabase, eventId));
    } catch (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to fetch event meet link",
          toAppError(error),
        ),
      );
    }
  }
}
