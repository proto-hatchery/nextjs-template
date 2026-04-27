import "server-only"
import { insertPsychologistPreferencesAction } from "@workspace/supabase-data/actions/preferences/psychologist-preferences-insert.codegen"
import { listPsychologistPreferencesAction } from "@workspace/supabase-data/actions/preferences/psychologist-preferences-list.codegen"
import { updatePsychologistPreferencesAction } from "@workspace/supabase-data/actions/preferences/psychologist-preferences-update.codegen"

// ---------------------------------------------------------------------------
// Internal blob helpers — kept private to this service layer.
// Apps only call the exported upsert* functions and never touch raw blobs.
// ---------------------------------------------------------------------------

type PreferencesBlob = Record<string, unknown>

function parseBlob(value: unknown): PreferencesBlob {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
        ? (parsed as PreferencesBlob)
        : {}
    } catch {
      return {}
    }
  }
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as PreferencesBlob
  }
  return {}
}

function toRecord(value: unknown): PreferencesBlob {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? { ...(value as PreferencesBlob) }
    : {}
}

function serializeBlob(value: PreferencesBlob): string {
  return JSON.stringify(value)
}

// ---------------------------------------------------------------------------
// Read helper — used internally by all upsert functions.
// RLS on psychologist_preferences ensures the result belongs to the
// authenticated user; no userId filter is needed at the query level.
// ---------------------------------------------------------------------------

async function getExistingPreferences(_userId: string) {
  const result = await listPsychologistPreferencesAction({})
  return result?.rows?.[0] ?? null
}

// ---------------------------------------------------------------------------
// Upsert helpers — shared business logic, usable by any app or service.
// ---------------------------------------------------------------------------

export type GeneralPreferencesInput = {
  displayName: string
  locale: string
  timezone: string
  workspaceName: string
}

export type NotificationsPreferencesInput = {
  notificationsBillingAlerts: boolean
  notificationsEmailReminders: boolean
  notificationsMarketing: boolean
  notificationsPaymentReceipts: boolean
  notificationsWhatsappReminders: boolean
}

export type SecurityPreferencesInput = {
  twoFactorEnabled: boolean
  recoveryEmailConfirmed: boolean
  notificationsSecurityAlerts: boolean
}

/**
 * Upserts the general section of the preferences blob.
 * Creates the record if it does not exist; merges into the existing blob otherwise.
 */
async function upsertGeneralPreferences(
  userId: string,
  input: GeneralPreferencesInput
): Promise<void> {
  const existing = await getExistingPreferences(userId)
  const blob = parseBlob(existing?.preferences)
  const profile = toRecord(blob.profile)
  const workspace = toRecord(blob.workspace)

  const nextBlob: PreferencesBlob = {
    ...blob,
    displayName: input.displayName,
    locale: input.locale,
    timezone: input.timezone,
    workspaceName: input.workspaceName,
    profile: {
      ...profile,
      displayName: input.displayName,
      locale: input.locale,
      timezone: input.timezone,
    },
    workspace: { ...workspace, name: input.workspaceName },
  }

  const payload = { preferences: serializeBlob(nextBlob) }

  if (existing) {
    await updatePsychologistPreferencesAction({ id: existing.id as string, data: payload })
  } else {
    await insertPsychologistPreferencesAction({ userId, ...payload })
  }
}

/**
 * Upserts the notifications section.
 * Notifications are flat columns — no blob merge needed.
 */
async function upsertNotificationsPreferences(
  userId: string,
  input: NotificationsPreferencesInput
): Promise<void> {
  const existing = await getExistingPreferences(userId)
  const payload = {
    notificationsBillingAlerts: input.notificationsBillingAlerts,
    notificationsEmailReminders: input.notificationsEmailReminders,
    notificationsMarketing: input.notificationsMarketing,
    notificationsPaymentReceipts: input.notificationsPaymentReceipts,
    notificationsWhatsappReminders: input.notificationsWhatsappReminders,
  }

  if (existing) {
    await updatePsychologistPreferencesAction({ id: existing.id as string, data: payload })
  } else {
    await insertPsychologistPreferencesAction({ userId, ...payload })
  }
}

/**
 * Upserts the security section — merges into the blob and updates the flat column.
 */
async function upsertSecurityPreferences(
  userId: string,
  input: SecurityPreferencesInput
): Promise<void> {
  const existing = await getExistingPreferences(userId)
  const blob = parseBlob(existing?.preferences)
  const security = toRecord(blob.security)

  const nextBlob: PreferencesBlob = {
    ...blob,
    twoFactorEnabled: input.twoFactorEnabled,
    recoveryEmailConfirmed: input.recoveryEmailConfirmed,
    security: {
      ...security,
      twoFactorEnabled: input.twoFactorEnabled,
      recoveryEmailConfirmed: input.recoveryEmailConfirmed,
    },
  }

  const payload = {
    notificationsSecurityAlerts: input.notificationsSecurityAlerts,
    preferences: serializeBlob(nextBlob),
  }

  if (existing) {
    await updatePsychologistPreferencesAction({ id: existing.id as string, data: payload })
  } else {
    await insertPsychologistPreferencesAction({ userId, ...payload })
  }
}

export { upsertGeneralPreferences, upsertNotificationsPreferences, upsertSecurityPreferences }
