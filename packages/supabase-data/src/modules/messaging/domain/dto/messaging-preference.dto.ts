export type MessagingCategory = "session_reminder";
export type MessagingRecipientRole = "patient" | "psychologist";
export type MessagingChannel = "whatsapp";

export interface MessagingPreferenceDTO {
  readonly category: MessagingCategory;
  readonly recipientRole: MessagingRecipientRole;
  readonly channel: MessagingChannel;
  readonly isEnabled: boolean;
}

export interface MessagingPreferenceWithMetadataDTO extends MessagingPreferenceDTO {
  readonly id: string | null;
  readonly psychologistId: string;
  readonly createdAt: string | null;
  readonly updatedAt: string | null;
}

export type UpdateMessagingPreferenceInput = MessagingPreferenceDTO;

const DEFAULT_MESSAGING_PREFERENCES: readonly MessagingPreferenceDTO[] = [
  {
    category: "session_reminder",
    recipientRole: "patient",
    channel: "whatsapp",
    isEnabled: true,
  },
  {
    category: "session_reminder",
    recipientRole: "psychologist",
    channel: "whatsapp",
    isEnabled: false,
  },
] as const;

export function getDefaultMessagingPreferences(): MessagingPreferenceDTO[] {
  return [...DEFAULT_MESSAGING_PREFERENCES];
}
