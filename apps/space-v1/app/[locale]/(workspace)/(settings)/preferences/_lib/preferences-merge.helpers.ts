import type { PsychologistPreferencesDTO } from "@workspace/supabase-data/modules/preferences/domain/dto/psychologist-preferences.dto.codegen"

import { parsePreferencesBlob, serializePreferencesBlob } from "./preferences-record"
import type { GeneralPrefsSchema, NotificationsPrefsSchema, SecurityPrefsSchema } from "./schemas"

type PreferencesBlob = Record<string, unknown>

function ensureRecord(value: unknown): PreferencesBlob {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? { ...(value as PreferencesBlob) }
    : {}
}

function mergeGeneralPrefs(
  existing: PsychologistPreferencesDTO | null,
  input: GeneralPrefsSchema
) {
  const nextBlob = {
    ...parsePreferencesBlob(existing?.preferences),
  }
  const profile = ensureRecord(nextBlob.profile)
  const workspace = ensureRecord(nextBlob.workspace)

  nextBlob.displayName = input.displayName
  nextBlob.locale = input.locale
  nextBlob.timezone = input.timezone
  nextBlob.workspaceName = input.workspaceName
  nextBlob.profile = {
    ...profile,
    displayName: input.displayName,
    locale: input.locale,
    timezone: input.timezone,
  }
  nextBlob.workspace = {
    ...workspace,
    name: input.workspaceName,
  }

  return {
    preferences: serializePreferencesBlob(nextBlob),
  }
}

function mergeNotificationsPrefs(
  _existing: PsychologistPreferencesDTO | null,
  input: NotificationsPrefsSchema
) {
  return {
    notificationsBillingAlerts: input.notificationsBillingAlerts,
    notificationsEmailReminders: input.notificationsEmailReminders,
    notificationsMarketing: input.notificationsMarketing,
    notificationsPaymentReceipts: input.notificationsPaymentReceipts,
    notificationsWhatsappReminders: input.notificationsWhatsappReminders,
  }
}

function mergeSecurityPrefs(
  existing: PsychologistPreferencesDTO | null,
  input: SecurityPrefsSchema
) {
  const nextBlob = {
    ...parsePreferencesBlob(existing?.preferences),
  }
  const security = ensureRecord(nextBlob.security)

  nextBlob.twoFactorEnabled = input.twoFactorEnabled
  nextBlob.recoveryEmailConfirmed = input.recoveryEmailConfirmed
  nextBlob.security = {
    ...security,
    twoFactorEnabled: input.twoFactorEnabled,
    recoveryEmailConfirmed: input.recoveryEmailConfirmed,
  }

  return {
    notificationsSecurityAlerts: input.notificationsSecurityAlerts,
    preferences: serializePreferencesBlob(nextBlob),
  }
}

export { mergeGeneralPrefs, mergeNotificationsPrefs, mergeSecurityPrefs }
