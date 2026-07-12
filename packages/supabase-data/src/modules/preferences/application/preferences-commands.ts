import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";
import type { AppError } from "../../../lib/errors/app-error";
import type { Result } from "neverthrow";
import type {
  UpdateUserPreferencesInput,
  UserPreferencesWithMetadataDTO,
} from "../domain/dto/user-preferences.dto";
import { PreferencesSupabaseRepository } from "../infrastructure/repositories/preferences-supabase.repository";

export function updateUserPreferencesForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: UpdateUserPreferencesInput,
): Promise<Result<UserPreferencesWithMetadataDTO, AppError>> {
  const repository = new PreferencesSupabaseRepository(supabase);
  return repository.updatePreferences(userId, input);
}
