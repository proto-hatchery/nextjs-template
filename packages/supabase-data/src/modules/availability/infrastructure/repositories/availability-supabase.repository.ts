import type { SupabaseClient } from "@supabase/supabase-js";
import { err, ok, type Result } from "neverthrow";
import {
  AppError,
  AppErrorCode,
  type AppError as AppErrorType,
} from "../../../../lib/errors/app-error";
import type { Database } from "@workspace/supabase-infra/types/database";
import type { AvailabilityRepository } from "../../domain/ports/availability-repository.port";
import type {
  AvailabilityExceptionDTO,
  WeeklyAvailabilityConfigDTO,
} from "../../domain/dto/availability.dto";
import type {
  CreateExceptionInput,
  SaveWeeklyAvailabilityConfigInput,
  UpdateExceptionInput,
} from "../../../../utils/validation-schemas";
import {
  toAvailabilityExceptionDTO,
  toWeeklyAvailabilityConfig,
  toWeeklyScheduleInsertRows,
} from "../mappers/availability.mapper";

type WeeklyScheduleSelectRow = Pick<
  Database["public"]["Tables"]["psychologist_weekly_schedules"]["Row"],
  | "id"
  | "day_of_week"
  | "start_time"
  | "end_time"
  | "is_active"
  | "delivery_mode"
  | "location_id"
  | "daily_appointment_limit"
>;

export class AvailabilitySupabaseRepository implements AvailabilityRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getWeeklyConfig(
    psychologistId: string,
  ): Promise<Result<WeeklyAvailabilityConfigDTO, AppErrorType>> {
    try {
      const { data, error } = await this.supabase
        .from("psychologist_weekly_schedules")
        .select(
          "id, day_of_week, start_time, end_time, is_active, delivery_mode, location_id, daily_appointment_limit",
        )
        .eq("psychologist_id", psychologistId);

      if (error) {
        return err(
          AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to fetch weekly availability", error),
        );
      }

      return ok(toWeeklyAvailabilityConfig((data ?? []) as WeeklyScheduleSelectRow[]));
    } catch (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Unexpected error fetching weekly availability",
          error,
        ),
      );
    }
  }

  async listExceptions(
    psychologistId: string,
    options: { fromDate?: string; limit?: number } = {},
  ): Promise<Result<readonly AvailabilityExceptionDTO[], AppErrorType>> {
    try {
      const fromDate = options.fromDate ?? new Date().toISOString().split("T")[0];
      const limit = options.limit ?? 50;

      const { data, error } = await this.supabase
        .from("availability_exceptions")
        .select("*")
        .eq("psychologist_id", psychologistId)
        .gte("exception_date", fromDate)
        .order("exception_date", { ascending: true })
        .limit(limit);

      if (error) {
        return err(
          AppError.infra(
            AppErrorCode.INFRA_SUPABASE,
            "Failed to fetch availability exceptions",
            error,
          ),
        );
      }

      return ok((data ?? []).map(toAvailabilityExceptionDTO));
    } catch (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Unexpected error fetching availability exceptions",
          error,
        ),
      );
    }
  }

  async getExceptionById(
    psychologistId: string,
    exceptionId: string,
  ): Promise<Result<AvailabilityExceptionDTO | null, AppErrorType>> {
    try {
      const { data, error } = await this.supabase
        .from("availability_exceptions")
        .select("*")
        .eq("id", exceptionId)
        .eq("psychologist_id", psychologistId)
        .maybeSingle();

      if (error) {
        return err(
          AppError.infra(
            AppErrorCode.INFRA_SUPABASE,
            "Failed to fetch availability exception",
            error,
          ),
        );
      }

      return ok(data ? toAvailabilityExceptionDTO(data) : null);
    } catch (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Unexpected error fetching availability exception",
          error,
        ),
      );
    }
  }

  async saveWeeklyConfig(
    psychologistId: string,
    input: SaveWeeklyAvailabilityConfigInput,
  ): Promise<Result<void, AppErrorType>> {
    try {
      const daysToDelete = input.weeklyDays.map((day) => day.dayOfWeek);

      if (daysToDelete.length > 0) {
        const { error: deleteError } = await this.supabase
          .from("psychologist_weekly_schedules")
          .delete()
          .eq("psychologist_id", psychologistId)
          .in("day_of_week", daysToDelete);

        if (deleteError) {
          return err(
            AppError.infra(
              AppErrorCode.INFRA_SUPABASE,
              "Failed to replace weekly availability",
              deleteError,
            ),
          );
        }
      }

      const rowsToInsert = toWeeklyScheduleInsertRows(psychologistId, input);
      if (rowsToInsert.length > 0) {
        const { error: insertError } = await this.supabase
          .from("psychologist_weekly_schedules")
          .insert(rowsToInsert);

        if (insertError) {
          return err(
            AppError.infra(
              AppErrorCode.INFRA_SUPABASE,
              "Failed to save weekly availability",
              insertError,
            ),
          );
        }
      }

      return ok(undefined);
    } catch (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Unexpected error saving weekly availability",
          error,
        ),
      );
    }
  }

  async createException(
    psychologistId: string,
    input: CreateExceptionInput,
  ): Promise<Result<{ id: string }, AppErrorType>> {
    try {
      const { data: existing, error: existingError } = await this.supabase
        .from("availability_exceptions")
        .select("id")
        .eq("psychologist_id", psychologistId)
        .eq("exception_date", input.exceptionDate)
        .eq("is_available", input.isAvailable)
        .maybeSingle();

      if (existingError) {
        return err(
          AppError.infra(
            AppErrorCode.INFRA_SUPABASE,
            "Failed to verify duplicate exception",
            existingError,
          ),
        );
      }

      if (existing) {
        return err(
          AppError.conflict(
            AppErrorCode.CONFLICT_DUPLICATE,
            "Ja existe uma excecao para esta data com o mesmo tipo",
          ),
        );
      }

      const { data, error } = await this.supabase
        .from("availability_exceptions")
        .insert({
          psychologist_id: psychologistId,
          exception_date: input.exceptionDate,
          is_available: input.isAvailable,
          start_time: input.startTime ?? null,
          end_time: input.endTime ?? null,
          reason: input.reason ?? null,
        })
        .select("id")
        .single();

      if (error || !data) {
        return err(
          AppError.infra(
            AppErrorCode.INFRA_SUPABASE,
            "Failed to create availability exception",
            error,
          ),
        );
      }

      if (!input.isAvailable && input.createGoogleEvent) {
        const startDatetime = input.startTime
          ? `${input.exceptionDate}T${input.startTime}:00`
          : `${input.exceptionDate}T00:00:00`;
        const endDatetime = input.endTime
          ? `${input.exceptionDate}T${input.endTime}:00`
          : `${input.exceptionDate}T23:59:59`;
        const durationMinutes = Math.max(
          1,
          Math.round((new Date(endDatetime).getTime() - new Date(startDatetime).getTime()) / 60000),
        );

        const { error: calendarError } = await this.supabase.from("calendar_events").insert({
          psychologist_id: psychologistId,
          event_type: "block",
          title: input.reason ?? "Bloqueio",
          start_datetime: startDatetime,
          end_datetime: endDatetime,
          duration_minutes: durationMinutes,
          all_day: !input.startTime,
          source: "fluri",
          google_sync_status: "pending",
        });

        if (calendarError) {
          return err(
            AppError.infra(
              AppErrorCode.INFRA_SUPABASE,
              "Availability exception created but calendar block sync failed",
              calendarError,
            ),
          );
        }
      }

      return ok({ id: data.id });
    } catch (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Unexpected error creating availability exception",
          error,
        ),
      );
    }
  }

  async deleteException(
    psychologistId: string,
    exceptionId: string,
  ): Promise<Result<void, AppErrorType>> {
    try {
      const { error } = await this.supabase
        .from("availability_exceptions")
        .delete()
        .eq("id", exceptionId)
        .eq("psychologist_id", psychologistId);

      if (error) {
        return err(
          AppError.infra(
            AppErrorCode.INFRA_SUPABASE,
            "Failed to delete availability exception",
            error,
          ),
        );
      }

      return ok(undefined);
    } catch (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Unexpected error deleting availability exception",
          error,
        ),
      );
    }
  }

  async updateException(
    psychologistId: string,
    input: UpdateExceptionInput,
  ): Promise<Result<void, AppErrorType>> {
    try {
      const updateData: Database["public"]["Tables"]["availability_exceptions"]["Update"] = {};
      if (input.exceptionDate !== undefined) updateData.exception_date = input.exceptionDate;
      if (input.isAvailable !== undefined) updateData.is_available = input.isAvailable;
      if (input.startTime !== undefined) updateData.start_time = input.startTime;
      if (input.endTime !== undefined) updateData.end_time = input.endTime;
      if (input.reason !== undefined) updateData.reason = input.reason;

      const { error } = await this.supabase
        .from("availability_exceptions")
        .update(updateData)
        .eq("id", input.exceptionId)
        .eq("psychologist_id", psychologistId);

      if (error) {
        return err(
          AppError.infra(
            AppErrorCode.INFRA_SUPABASE,
            "Failed to update availability exception",
            error,
          ),
        );
      }

      return ok(undefined);
    } catch (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Unexpected error updating availability exception",
          error,
        ),
      );
    }
  }
}
