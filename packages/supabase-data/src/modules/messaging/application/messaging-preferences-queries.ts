import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";
import type { AppError } from "../../../lib/errors/app-error";
import type { Result } from "neverthrow";
import type { MessagingPreferenceDTO } from "../domain/dto/messaging-preference.dto";
import { MessagingPreferencesSupabaseRepository } from "../infrastructure/repositories/messaging-preferences-supabase.repository";

export function getMessagingPreferencesForUser(
  supabase: SupabaseClient<Database>,
  psychologistId: string,
): Promise<Result<MessagingPreferenceDTO[], AppError>> {
  const repository = new MessagingPreferencesSupabaseRepository(supabase);
  return repository.getPreferences(psychologistId);
}
