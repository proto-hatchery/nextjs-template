import type { Result } from "neverthrow";
import type { AppError } from "../../../../lib/errors/app-error";
import type { SessionFilters, SessionWithDetails } from "@workspace/supabase-data/types/entities";

export interface SessionRepository {
  listPsychologistSessions(
    psychologistId: string,
    filters?: SessionFilters,
    timezone?: string,
  ): Promise<Result<SessionWithDetails[], AppError>>;
  getSessionDetails(
    sessionId: string,
    timezone?: string,
  ): Promise<Result<SessionWithDetails | null, AppError>>;
  listUpcomingSessions(
    psychologistId: string,
    limit?: number,
    timezone?: string,
  ): Promise<Result<SessionWithDetails[], AppError>>;
  listPatientSessions(
    patientId: string,
    limit?: number,
    timezone?: string,
  ): Promise<Result<SessionWithDetails[], AppError>>;
  listTodaySessions(
    psychologistId: string,
    timezone?: string,
  ): Promise<Result<SessionWithDetails[], AppError>>;
  getOldestOpenSession(
    psychologistId: string,
    timezone?: string,
  ): Promise<Result<SessionWithDetails | null, AppError>>;
  listPatientDashboardSessions(
    limit?: number,
    timezone?: string,
  ): Promise<Result<SessionWithDetails[], AppError>>;
  getEventMeetLink(eventId: string): Promise<Result<string | null, AppError>>;
}
