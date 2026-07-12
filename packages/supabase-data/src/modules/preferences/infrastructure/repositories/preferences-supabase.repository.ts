import type { SupabaseClient } from "@supabase/supabase-js";
import { err, ok, type Result } from "neverthrow";
import {
  AppError,
  AppErrorCode,
  type AppError as AppErrorType,
} from "../../../../lib/errors/app-error";
import type { Database } from "@workspace/supabase-infra/types/database";
import type { PreferencesRepository } from "../../domain/ports/preferences-repository.port";
import type {
  UpdateUserPreferencesInput,
  UserPreferencesDTO,
  UserPreferencesWithMetadataDTO,
} from "../../domain/dto/user-preferences.dto";
import {
  toPreferencesInsert,
  toPreferencesUpdate,
  toUserPreferencesDTO,
  toUserPreferencesWithMetadataDTO,
} from "../mappers/preferences.mapper";

export class PreferencesSupabaseRepository implements PreferencesRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getPreferences(userId: string): Promise<Result<UserPreferencesDTO, AppErrorType>> {
    const { data, error } = await this.supabase
      .from("psychologist_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to fetch user preferences", error),
      );
    }

    return ok(toUserPreferencesDTO(data));
  }

  async getPreferencesWithMetadata(
    userId: string,
  ): Promise<Result<UserPreferencesWithMetadataDTO | null, AppErrorType>> {
    const { data, error } = await this.supabase
      .from("psychologist_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to fetch user preferences with metadata",
          error,
        ),
      );
    }

    return ok(data ? toUserPreferencesWithMetadataDTO(data) : null);
  }

  async updatePreferences(
    userId: string,
    input: UpdateUserPreferencesInput,
  ): Promise<Result<UserPreferencesWithMetadataDTO, AppErrorType>> {
    const { data: existing, error: fetchError } = await this.supabase
      .from("psychologist_preferences")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to check existing preferences",
          fetchError,
        ),
      );
    }

    if (existing) {
      const { data, error } = await this.supabase
        .from("psychologist_preferences")
        .update(toPreferencesUpdate(input))
        .eq("user_id", userId)
        .select("*")
        .single();

      if (error) {
        return err(
          AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to update preferences", error),
        );
      }

      return ok(toUserPreferencesWithMetadataDTO(data));
    }

    const { data, error } = await this.supabase
      .from("psychologist_preferences")
      .insert(toPreferencesInsert(userId, input))
      .select("*")
      .single();

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to create preferences", error),
      );
    }

    return ok(toUserPreferencesWithMetadataDTO(data));
  }
}
