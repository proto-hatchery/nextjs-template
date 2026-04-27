export type CalendarViewMode = "month" | "day"

export type CalendarKindFilter =
  | "all"
  | "clinical-session"
  | "meeting"
  | "supervision"
  | "block"
  | "other"

export type CalendarFilterState = {
  date: string
  view: CalendarViewMode
  kind: CalendarKindFilter
}

export type CalendarMetric = {
  label: string
  value: string
  context: string
}

export type CalendarLegendItem = {
  label: string
  count: number
  tone: "default" | "muted"
}

export type CalendarMonthDay = {
  isoDate: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  totalItems: number
  sessionItems: number
  blockedItems: number
}

export type CalendarAgendaItem = {
  id: string
  title: string
  when: string
  kind: string
  patientName: string | null
  status: string | null
  serviceName: string | null
  location: string | null
}

export type CalendarIssue = {
  id: string
  title: string
  detail: string
}

export type CalendarSyncCard = {
  title: string
  detail: string
}

export type CalendarWorkspaceView = {
  filters: CalendarFilterState
  metrics: CalendarMetric[]
  monthLabel: string
  selectedDateLabel: string
  ownershipSummary: string
  legend: CalendarLegendItem[]
  monthDays: CalendarMonthDay[]
  agenda: CalendarAgendaItem[]
  emptyAgendaMessage: string
  compatibilityIssues: CalendarIssue[]
  availabilityHighlights: string[]
  syncCards: CalendarSyncCard[]
}
