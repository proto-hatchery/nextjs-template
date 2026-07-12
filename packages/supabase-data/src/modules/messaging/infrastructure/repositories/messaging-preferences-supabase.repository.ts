import type { SupabaseClient } from "@supabase/supabase-js";
import { err, ok, type Result } from "neverthrow";
import {
  AppError,
  AppErrorCode,
  type AppError as AppErrorType,
} from "../../../../lib/errors/app-error";
import type { Database } from "@workspace/supabase-infra/types/database";
import type { MessagingPreferencesRepository } from "../../domain/ports/messaging-preferences-repository.port";
import type {
  MessagingPreferenceDTO,
  MessagingPreferenceWithMetadataDTO,
  UpdateMessagingPreferenceInput,
} from "../../domain/dto/messaging-preference.dto";
import {
  mergeMessagingPreferencesWithDefaults,
  toMessagingPreferenceInsert,
  toMessagingPreferenceWithMetadataDTO,
} from "../mappers/messaging-preference.mapper";

export class MessagingPreferencesSupabaseRepository implements MessagingPreferencesRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getPreferences(
    psychologistId: string,
  ): Promise<Result<MessagingPreferenceDTO[], AppErrorType>> {
    const { data, error } = await this.supabase
      .from("psychologist_message_preferences")
      .select("*")
      .eq("psychologist_id", psychologistId);

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to fetch messaging preferences", error),
      );
    }

    return ok(mergeMessagingPreferencesWithDefaults(data ?? []));
  }

  async upsertPreference(
    psychologistId: string,
    input: UpdateMessagingPreferenceInput,
  ): Promise<Result<MessagingPreferenceWithMetadataDTO, AppErrorType>> {
    const { data, error } = await this.supabase
      .from("psychologist_message_preferences")
      .upsert(toMessagingPreferenceInsert(psychologistId, input), {
        onConflict: "psychologist_id,category,recipient_role,channel",
      })
      .select("*")
      .single();

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to update messaging preference", error),
      );
    }

    return ok(toMessagingPreferenceWithMetadataDTO(data));
  }
}
