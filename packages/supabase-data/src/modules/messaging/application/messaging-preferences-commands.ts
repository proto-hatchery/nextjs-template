import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";
import type { AppError } from "../../../lib/errors/app-error";
import type { Result } from "neverthrow";
import type {
  MessagingPreferenceWithMetadataDTO,
  UpdateMessagingPreferenceInput,
} from "../domain/dto/messaging-preference.dto";
import { MessagingPreferencesSupabaseRepository } from "../infrastructure/repositories/messaging-preferences-supabase.repository";

export function updateMessagingPreferenceForUser(
  supabase: SupabaseClient<Database>,
  psychologistId: string,
  input: UpdateMessagingPreferenceInput,
): Promise<Result<MessagingPreferenceWithMetadataDTO, AppError>> {
  const repository = new MessagingPreferencesSupabaseRepository(supabase);
  return repository.upsertPreference(psychologistId, input);
}
