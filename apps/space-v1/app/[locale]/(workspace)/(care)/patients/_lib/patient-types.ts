export type PatientStatus = "Active care" | "Needs follow-up" | "Intake scheduled" | "Stepped down"

export type PatientDirectoryFilterState = {
  query: string
  status: PatientStatus | "all"
  sort: "name" | "next-session" | "recent-activity"
}

export type PatientSummaryMetric = {
  label: string
  value: string
}

export type PatientTimelineEntry = {
  id: string
  title: string
  when: string
  detail: string
}

export type PatientAdministrativeMarker = {
  id: string
  label: string
  value: string
}

export type PatientProfile = {
  id: string
  name: string
  initials: string
  status: PatientStatus
  lastSession: string
  nextSession: string
  cadence: string
  focusArea: string
  primaryGoal: string
  contactPreference: string
  coordinatorNote: string
  metrics: PatientSummaryMetric[]
  tags: string[]
  timeline: PatientTimelineEntry[]
  nextSteps: string[]
  administrativeMarkers: PatientAdministrativeMarker[]
}

export type PatientDirectoryView = {
  filters: PatientDirectoryFilterState
  filteredPatients: PatientProfile[]
  totalPatients: number
  stats: PatientSummaryMetric[]
  attentionQueue: string[]
}
