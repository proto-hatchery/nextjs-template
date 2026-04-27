export type SessionStatus = "Upcoming" | "Awaiting notes" | "Completed"

export type SessionChecklistItem = {
  id: string
  label: string
  done: boolean
}

export type SessionRecord = {
  id: string
  title: string
  patientId: string
  patientName: string
  startsAt: string
  status: SessionStatus
  format: string
  duration: string
  noteState: string
  focus: string
  checklist: SessionChecklistItem[]
  recap: string[]
  nextActions: string[]
}

export type SessionsBoardView = {
  groupedSessions: Array<{
    status: SessionStatus
    items: SessionRecord[]
  }>
  operationalNotes: string[]
}
