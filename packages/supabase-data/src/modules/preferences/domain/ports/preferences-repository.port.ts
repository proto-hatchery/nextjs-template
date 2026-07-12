import type { Result } from "neverthrow";
import type { AppError } from "../../../../lib/errors/app-error";
import type {
  UpdateUserPreferencesInput,
  UserPreferencesDTO,
  UserPreferencesWithMetadataDTO,
} from "../dto/user-preferences.dto";

export interface PreferencesRepository {
  getPreferences(userId: string): Promise<Result<UserPreferencesDTO, AppError>>;
  getPreferencesWithMetadata(
    userId: string,
  ): Promise<Result<UserPreferencesWithMetadataDTO | null, AppError>>;
  updatePreferences(
    userId: string,
    input: UpdateUserPreferencesInput,
  ): Promise<Result<UserPreferencesWithMetadataDTO, AppError>>;
}
