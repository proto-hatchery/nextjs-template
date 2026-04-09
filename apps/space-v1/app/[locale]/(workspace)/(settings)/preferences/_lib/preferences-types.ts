export type PreferencesRecordView = {
  id: string | null
  serializedPreferences: string
}

export type GeneralPreferencesView = {
  preferencesId: string | null
  displayName: string
  locale: string
  timezone: string
  workspaceName: string
  integrationIndicator: string
}

export type AvailabilityPreferencesView = {
  weeklyCapacity: string
  bufferPolicy: string
  bookingHorizon: string
  notes: string
  activeServicesSummary: string
}

export type NotificationPreferenceItem = {
  key:
    | "notificationsWhatsappReminders"
    | "notificationsEmailReminders"
    | "notificationsPaymentReceipts"
    | "notificationsBillingAlerts"
    | "notificationsMarketing"
  label: string
  description: string
  enabled: boolean
}

export type SecurityPreferencesView = {
  preferencesId: string | null
  lastPreferencesUpdate: string
  activePolicies: string[]
  recoveryState: string
  twoFactorEnabled: boolean
  recoveryEmailConfirmed: boolean
  securityAlertsEnabled: boolean
}

export type PreferencesSectionsView = {
  record: PreferencesRecordView
  general: GeneralPreferencesView
  availability: AvailabilityPreferencesView
  notifications: NotificationPreferenceItem[]
  security: SecurityPreferencesView
}
