export interface UserPreferencesDTO {
  readonly notificationsWhatsappReminders: boolean;
  readonly notificationsEmailReminders: boolean;
  readonly notificationsPaymentReceipts: boolean;
  readonly notificationsBillingAlerts: boolean;
  readonly notificationsSecurityAlerts: boolean;
  readonly notificationsMarketing: boolean;
  readonly sensitiveDataVisible: boolean;
}

export type UpdateUserPreferencesInput = Partial<UserPreferencesDTO>;

export interface UserPreferencesWithMetadataDTO extends UserPreferencesDTO {
  readonly id: string;
  readonly userId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export const DEFAULT_USER_PREFERENCES: Readonly<UserPreferencesDTO> = {
  notificationsWhatsappReminders: true,
  notificationsEmailReminders: true,
  notificationsPaymentReceipts: true,
  notificationsBillingAlerts: true,
  notificationsSecurityAlerts: true,
  notificationsMarketing: false,
  sensitiveDataVisible: true,
} as const;

export function mergeUserPreferencesWithDefaults(
  partial?: UpdateUserPreferencesInput,
): UserPreferencesDTO {
  return {
    ...DEFAULT_USER_PREFERENCES,
    ...partial,
  };
}
