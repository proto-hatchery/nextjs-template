import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  UpdateUserPreferencesInput,
  UserPreferencesDTO,
  UserPreferencesWithMetadataDTO,
} from "../../domain/dto/user-preferences.dto";
import { DEFAULT_USER_PREFERENCES } from "../../domain/dto/user-preferences.dto";

type PreferencesRow = Database["public"]["Tables"]["psychologist_preferences"]["Row"];
type PreferencesInsert = Database["public"]["Tables"]["psychologist_preferences"]["Insert"];
type PreferencesUpdate = Database["public"]["Tables"]["psychologist_preferences"]["Update"];

export function toUserPreferencesDTO(row: PreferencesRow | null): UserPreferencesDTO {
  if (!row) {
    return { ...DEFAULT_USER_PREFERENCES };
  }

  return {
    notificationsWhatsappReminders:
      row.notifications_whatsapp_reminders ??
      DEFAULT_USER_PREFERENCES.notificationsWhatsappReminders,
    notificationsEmailReminders:
      row.notifications_email_reminders ?? DEFAULT_USER_PREFERENCES.notificationsEmailReminders,
    notificationsPaymentReceipts:
      row.notifications_payment_receipts ?? DEFAULT_USER_PREFERENCES.notificationsPaymentReceipts,
    notificationsBillingAlerts:
      row.notifications_billing_alerts ?? DEFAULT_USER_PREFERENCES.notificationsBillingAlerts,
    notificationsSecurityAlerts:
      row.notifications_security_alerts ?? DEFAULT_USER_PREFERENCES.notificationsSecurityAlerts,
    notificationsMarketing:
      row.notifications_marketing ?? DEFAULT_USER_PREFERENCES.notificationsMarketing,
    sensitiveDataVisible:
      row.sensitive_data_visible ?? DEFAULT_USER_PREFERENCES.sensitiveDataVisible,
  };
}

export function toUserPreferencesWithMetadataDTO(
  row: PreferencesRow,
): UserPreferencesWithMetadataDTO {
  return {
    ...toUserPreferencesDTO(row),
    id: row.id,
    userId: row.user_id ?? "",
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

export function toPreferencesInsert(
  userId: string,
  input: UpdateUserPreferencesInput,
): PreferencesInsert {
  const merged = {
    ...DEFAULT_USER_PREFERENCES,
    ...input,
  };

  return {
    user_id: userId,
    notifications_whatsapp_reminders: merged.notificationsWhatsappReminders,
    notifications_email_reminders: merged.notificationsEmailReminders,
    notifications_payment_receipts: merged.notificationsPaymentReceipts,
    notifications_billing_alerts: merged.notificationsBillingAlerts,
    notifications_security_alerts: merged.notificationsSecurityAlerts,
    notifications_marketing: merged.notificationsMarketing,
    sensitive_data_visible: merged.sensitiveDataVisible,
  };
}

export function toPreferencesUpdate(input: UpdateUserPreferencesInput): PreferencesUpdate {
  const update: PreferencesUpdate = {
    updated_at: new Date().toISOString(),
  };

  if (input.notificationsWhatsappReminders !== undefined) {
    update.notifications_whatsapp_reminders = input.notificationsWhatsappReminders;
  }
  if (input.notificationsEmailReminders !== undefined) {
    update.notifications_email_reminders = input.notificationsEmailReminders;
  }
  if (input.notificationsPaymentReceipts !== undefined) {
    update.notifications_payment_receipts = input.notificationsPaymentReceipts;
  }
  if (input.notificationsBillingAlerts !== undefined) {
    update.notifications_billing_alerts = input.notificationsBillingAlerts;
  }
  if (input.notificationsSecurityAlerts !== undefined) {
    update.notifications_security_alerts = input.notificationsSecurityAlerts;
  }
  if (input.notificationsMarketing !== undefined) {
    update.notifications_marketing = input.notificationsMarketing;
  }
  if (input.sensitiveDataVisible !== undefined) {
    update.sensitive_data_visible = input.sensitiveDataVisible;
  }

  return update;
}
