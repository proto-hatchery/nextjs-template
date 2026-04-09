import "server-only"

import {
  listPsychologistPreferencesAction,
} from "@workspace/supabase-data/actions/preferences/psychologist-preferences-list.codegen"
import {
  listPsychologistServicesAction,
} from "@workspace/supabase-data/actions/preferences/psychologist-services-list.codegen"
import type { PsychologistPreferencesDTO } from "@workspace/supabase-data/modules/preferences/domain/dto/psychologist-preferences.dto.codegen"
import type { PsychologistServicesDTO } from "@workspace/supabase-data/modules/preferences/domain/dto/psychologist-services.dto.codegen"

import type {
  AvailabilityPreferencesView,
  GeneralPreferencesView,
  NotificationPreferenceItem,
  PreferencesRecordView,
  PreferencesSectionsView,
  SecurityPreferencesView,
} from "@/app/[locale]/(workspace)/(settings)/preferences/_lib/preferences-types"
import {
  asBoolean,
  asNumber,
  asString,
  parsePreferencesBlob,
  readNestedBoolean,
  readNestedNumber,
  readNestedString,
  serializePreferencesBlob,
} from "@/app/[locale]/(workspace)/(settings)/preferences/_lib/preferences-record"

function formatDateTimeLabel(value: unknown, emptyLabel: string) {
  const dateValue = asString(value)

  if (!dateValue) {
    return emptyLabel
  }

  const parsed = new Date(dateValue)

  if (Number.isNaN(parsed.getTime())) {
    return dateValue
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(value)
}

function formatServiceSummary(service: PsychologistServicesDTO) {
  const name = asString(service.name) ?? "Unnamed service"
  const duration = `${asNumber(service.durationMinutes) ?? 50} min`
  const price = typeof service.price === "number" ? formatCurrency(service.price) : "Price pending"

  return `${name} • ${duration} • ${price}`
}

function buildGeneralView(
  preferences: PsychologistPreferencesDTO | null,
  services: PsychologistServicesDTO[]
): GeneralPreferencesView {
  const blob = parsePreferencesBlob(preferences?.preferences)
  const serviceCount = services.filter((service) => asBoolean(service.isActive) !== false).length
  const googleCalendarConnected = readNestedBoolean(blob, [
    ["googleCalendarConnected"],
    ["integrations", "googleCalendarConnected"],
    ["calendar", "googleConnected"],
  ])

  return {
    preferencesId: asString(preferences?.id),
    displayName:
      readNestedString(blob, [["displayName"], ["profile", "displayName"], ["fullName"]]) ??
      "Workspace psychologist",
    locale:
      readNestedString(blob, [["locale"], ["profile", "locale"]]) ??
      "English (Ireland)",
    timezone:
      readNestedString(blob, [["timezone"], ["profile", "timezone"]]) ??
      "Europe/Lisbon",
    workspaceName:
      readNestedString(blob, [["workspaceName"], ["workspace", "name"]]) ??
      "Clinical workspace",
    integrationIndicator:
      googleCalendarConnected === true
        ? "Google Calendar appears connected in the stored preferences."
        : `${serviceCount} active services are currently visible through the shared preferences surface.`,
  }
}

function buildAvailabilityView(
  preferences: PsychologistPreferencesDTO | null,
  services: PsychologistServicesDTO[]
): AvailabilityPreferencesView {
  const blob = parsePreferencesBlob(preferences?.preferences)
  const activeServices = services.filter((service) => asBoolean(service.isActive) !== false)
  const weeklyCapacity =
    readNestedNumber(blob, [["weeklyCapacity"], ["availability", "weeklyCapacity"]])
  const bufferMinutes =
    readNestedNumber(blob, [["bufferMinutes"], ["availability", "bufferMinutes"]])
  const bookingHorizonDays =
    readNestedNumber(blob, [["bookingHorizonDays"], ["availability", "bookingHorizonDays"]])

  return {
    weeklyCapacity:
      typeof weeklyCapacity === "number"
        ? `${weeklyCapacity} sessions`
        : `${activeServices.length || 0} active services guiding the current workload`,
    bufferPolicy:
      typeof bufferMinutes === "number"
        ? `${bufferMinutes} minutes between sessions`
        : "Buffer policy not defined yet",
    bookingHorizon:
      typeof bookingHorizonDays === "number"
        ? `Open next ${bookingHorizonDays} days`
        : "Booking horizon not defined yet",
    notes:
      readNestedString(blob, [["availabilityNotes"], ["availability", "notes"]]) ??
      "Keep calendar-heavy operational rules in settings until the calendar domain is integrated.",
    activeServicesSummary: (() => {
      const firstActiveService = activeServices[0]

      if (!firstActiveService) {
        return "No active services are configured yet."
      }

      return formatServiceSummary(firstActiveService)
    })(),
  }
}

function buildNotificationsView(
  preferences: PsychologistPreferencesDTO | null
): NotificationPreferenceItem[] {
  return [
    {
      key: "notificationsWhatsappReminders",
      label: "Session reminders",
      description: "Notify before the first session of the day and before newly booked follow-ups.",
      enabled: asBoolean(preferences?.notificationsWhatsappReminders) === true,
    },
    {
      key: "notificationsEmailReminders",
      label: "Email reminders",
      description: "Send scheduling and operational reminder emails when timing matters.",
      enabled: asBoolean(preferences?.notificationsEmailReminders) === true,
    },
    {
      key: "notificationsPaymentReceipts",
      label: "Payment receipts",
      description: "Alert when payments are confirmed and receipt-related follow-up is available.",
      enabled: asBoolean(preferences?.notificationsPaymentReceipts) === true,
    },
    {
      key: "notificationsBillingAlerts",
      label: "Billing alerts",
      description: "Flag invoices or packages that still need manual confirmation.",
      enabled: asBoolean(preferences?.notificationsBillingAlerts) === true,
    },
    {
      key: "notificationsMarketing",
      label: "Marketing updates",
      description: "Receive product news and low-priority announcements.",
      enabled: asBoolean(preferences?.notificationsMarketing) === true,
    },
  ]
}

function buildSecurityView(preferences: PsychologistPreferencesDTO | null): SecurityPreferencesView {
  const blob = parsePreferencesBlob(preferences?.preferences)
  const twoFactorEnabled =
    readNestedBoolean(blob, [["twoFactorEnabled"], ["security", "twoFactorEnabled"]]) === true
  const recoveryConfirmed =
    readNestedBoolean(blob, [["recoveryEmailConfirmed"], ["security", "recoveryEmailConfirmed"]]) === true
  const securityAlertsEnabled = asBoolean(preferences?.notificationsSecurityAlerts) === true

  return {
    preferencesId: asString(preferences?.id),
    lastPreferencesUpdate: formatDateTimeLabel(
      preferences?.updatedAt ?? preferences?.createdAt,
      "Preferences record has not been updated yet"
    ),
    activePolicies: [
      twoFactorEnabled ? "Authenticator app is enabled" : "Two-factor auth is not configured yet",
      securityAlertsEnabled
        ? "Security alerts are enabled"
        : "Security alerts are not enabled yet",
    ],
    recoveryState: recoveryConfirmed
      ? "Recovery email confirmed"
      : "Recovery state is not available in the current read model",
    twoFactorEnabled,
    recoveryEmailConfirmed: recoveryConfirmed,
    securityAlertsEnabled,
  }
}

function buildRecordView(preferences: PsychologistPreferencesDTO | null): PreferencesRecordView {
  return {
    id: asString(preferences?.id),
    serializedPreferences: serializePreferencesBlob(parsePreferencesBlob(preferences?.preferences)),
  }
}

export async function getPreferencesRecord(_userId: string): Promise<PsychologistPreferencesDTO | null> {
  const preferencesResult = await listPsychologistPreferencesAction({ limit: 1, offset: 0 })

  return preferencesResult.rows[0] ?? null
}

export async function getPreferencesSectionsView(): Promise<PreferencesSectionsView> {
  const [preferencesResult, servicesResult] = await Promise.all([
    listPsychologistPreferencesAction({ limit: 1, offset: 0 }),
    listPsychologistServicesAction({ limit: 100, offset: 0 }),
  ])

  const preferences = preferencesResult.rows[0] ?? null
  const services = servicesResult.rows
    .slice()
    .sort((left, right) => (asNumber(left.sortOrder) ?? 0) - (asNumber(right.sortOrder) ?? 0))

  return {
    record: buildRecordView(preferences),
    general: buildGeneralView(preferences, services),
    availability: buildAvailabilityView(preferences, services),
    notifications: buildNotificationsView(preferences),
    security: buildSecurityView(preferences),
  }
}
