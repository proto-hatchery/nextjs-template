// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  PsychologistPreferencesDTOSchema,
  type PsychologistPreferencesDTO,
} from "@workspace/supabase-data/modules/preferences/domain/dto/psychologist-preferences.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type PsychologistPreferencesRow = Database["public"]["Tables"]["psychologist_preferences"]["Row"]
type PsychologistPreferencesInsert =
  Database["public"]["Tables"]["psychologist_preferences"]["Insert"]
type PsychologistPreferencesUpdate =
  Database["public"]["Tables"]["psychologist_preferences"]["Update"]

const PsychologistPreferencesFieldMappings = {
  createdAt: "created_at",
  id: "id",
  notificationsBillingAlerts: "notifications_billing_alerts",
  notificationsEmailReminders: "notifications_email_reminders",
  notificationsMarketing: "notifications_marketing",
  notificationsPaymentReceipts: "notifications_payment_receipts",
  notificationsSecurityAlerts: "notifications_security_alerts",
  notificationsWhatsappReminders: "notifications_whatsapp_reminders",
  preferences: "preferences",
  updatedAt: "updated_at",
  userId: "user_id",
} as const

type PsychologistPreferencesField = keyof typeof PsychologistPreferencesFieldMappings

function fromPsychologistPreferencesRow(
  row: PsychologistPreferencesRow
): PsychologistPreferencesDTO {
  const mapped = {
    createdAt: row.created_at,
    id: row.id,
    notificationsBillingAlerts: row.notifications_billing_alerts,
    notificationsEmailReminders: row.notifications_email_reminders,
    notificationsMarketing: row.notifications_marketing,
    notificationsPaymentReceipts: row.notifications_payment_receipts,
    notificationsSecurityAlerts: row.notifications_security_alerts,
    notificationsWhatsappReminders: row.notifications_whatsapp_reminders,
    preferences: row.preferences,
    updatedAt: row.updated_at,
    userId: row.user_id,
  }
  return PsychologistPreferencesDTOSchema.parse(mapped)
}

function toPsychologistPreferencesInsert(
  dto: Partial<PsychologistPreferencesDTO>
): PsychologistPreferencesInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(PsychologistPreferencesFieldMappings) as Array<
    [
      PsychologistPreferencesField,
      (typeof PsychologistPreferencesFieldMappings)[PsychologistPreferencesField],
    ]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as PsychologistPreferencesInsert
}

function toPsychologistPreferencesUpdate(
  dto: Partial<PsychologistPreferencesDTO>
): PsychologistPreferencesUpdate {
  return toPsychologistPreferencesInsert(dto) as PsychologistPreferencesUpdate
}

export {
  fromPsychologistPreferencesRow,
  toPsychologistPreferencesInsert,
  toPsychologistPreferencesUpdate,
}
