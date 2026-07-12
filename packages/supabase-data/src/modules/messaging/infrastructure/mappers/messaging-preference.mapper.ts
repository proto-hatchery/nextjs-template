import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  MessagingPreferenceDTO,
  MessagingPreferenceWithMetadataDTO,
  UpdateMessagingPreferenceInput,
} from "../../domain/dto/messaging-preference.dto";
import { getDefaultMessagingPreferences } from "../../domain/dto/messaging-preference.dto";

type PreferenceRow = Database["public"]["Tables"]["psychologist_message_preferences"]["Row"];
type PreferenceInsert = Database["public"]["Tables"]["psychologist_message_preferences"]["Insert"];

export function toMessagingPreferenceDTO(row: PreferenceRow): MessagingPreferenceDTO {
  return {
    category: row.category as MessagingPreferenceDTO["category"],
    recipientRole: row.recipient_role as MessagingPreferenceDTO["recipientRole"],
    channel: row.channel as MessagingPreferenceDTO["channel"],
    isEnabled: row.is_enabled,
  };
}

export function toMessagingPreferenceWithMetadataDTO(
  row: PreferenceRow,
): MessagingPreferenceWithMetadataDTO {
  return {
    id: row.id,
    psychologistId: row.psychologist_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...toMessagingPreferenceDTO(row),
  };
}

export function mergeMessagingPreferencesWithDefaults(
  rows: PreferenceRow[],
): MessagingPreferenceDTO[] {
  const defaults = getDefaultMessagingPreferences();

  return defaults.map((item) => {
    const override = rows.find(
      (row) =>
        row.category === item.category &&
        row.recipient_role === item.recipientRole &&
        row.channel === item.channel,
    );

    return override ? toMessagingPreferenceDTO(override) : item;
  });
}

export function toMessagingPreferenceInsert(
  psychologistId: string,
  input: UpdateMessagingPreferenceInput,
): PreferenceInsert {
  return {
    psychologist_id: psychologistId,
    category: input.category,
    recipient_role: input.recipientRole,
    channel: input.channel,
    is_enabled: input.isEnabled,
  };
}
