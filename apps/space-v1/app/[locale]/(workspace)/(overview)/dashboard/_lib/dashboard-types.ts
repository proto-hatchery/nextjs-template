export type DashboardMetric = {
  label: string
  value: string
  context: string
}

export type DashboardAgendaItem = {
  id: string
  startsAt: string
  title: string
  patientName: string
  format: string
  note: string
  href: string
}

export type DashboardAlert = {
  id: string
  title: string
  description: string
  tone: "default" | "destructive"
  actionLabel: string
  href: string
}

export type DashboardFocusArea = {
  id: string
  title: string
  summary: string
}

export type DashboardOverviewView = {
  metrics: DashboardMetric[]
  agenda: DashboardAgendaItem[]
  alerts: DashboardAlert[]
  focusAreas: DashboardFocusArea[]
}
