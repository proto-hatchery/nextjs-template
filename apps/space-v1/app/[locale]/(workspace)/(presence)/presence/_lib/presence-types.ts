export type PresenceProfileView = {
  headline: string
  bio: string
  serviceHighlights: string[]
  readinessChecks: string[]
  profileUrl: string | null
  publicStatusLabel: string
  completenessLabel: string
}

export type PresenceLinkItem = {
  label: string
  href: string
  status: string
}

export type PresenceLinksView = {
  items: PresenceLinkItem[]
  guidance: string[]
  visibleLinksCountLabel: string
}

export type PresencePreferenceItem = {
  label: string
  description: string
  enabled: boolean
}

export type PresencePreferencesView = {
  items: PresencePreferenceItem[]
  rolloutNotes: string[]
}

export type PresenceSectionsView = {
  profile: PresenceProfileView
  links: PresenceLinksView
  preferences: PresencePreferencesView
}
