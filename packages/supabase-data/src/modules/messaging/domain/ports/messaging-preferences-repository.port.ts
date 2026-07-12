import type { Result } from "neverthrow";
import type { AppError } from "../../../../lib/errors/app-error";
import type {
  MessagingPreferenceDTO,
  MessagingPreferenceWithMetadataDTO,
  UpdateMessagingPreferenceInput,
} from "../dto/messaging-preference.dto";

export interface MessagingPreferencesRepository {
  getPreferences(psychologistId: string): Promise<Result<MessagingPreferenceDTO[], AppError>>;
  upsertPreference(
    psychologistId: string,
    input: UpdateMessagingPreferenceInput,
  ): Promise<Result<MessagingPreferenceWithMetadataDTO, AppError>>;
}
