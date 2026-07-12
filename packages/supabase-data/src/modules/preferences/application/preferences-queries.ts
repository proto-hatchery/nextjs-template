import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";
import type { AppError } from "../../../lib/errors/app-error";
import type { Result } from "neverthrow";
import type { UserPreferencesDTO } from "../domain/dto/user-preferences.dto";
import { PreferencesSupabaseRepository } from "../infrastructure/repositories/preferences-supabase.repository";

export function getUserPreferences(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<Result<UserPreferencesDTO, AppError>> {
  const repository = new PreferencesSupabaseRepository(supabase);
  return repository.getPreferences(userId);
}
