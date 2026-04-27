export type NoteStatus = "Draft" | "Needs review" | "Signed"
export type NoteType = "Progress" | "Clinical" | "Assessment"

export type NoteSections = {
  summary: string
  observations: string[]
  plan: string[]
}

export type NoteRecord = {
  id: string
  title: string
  patientId: string
  patientName: string
  type: NoteType
  status: NoteStatus
  updatedAt: string
  sessionLabel: string
  excerpt: string
  sections: NoteSections
}

export type NotesFilterState = {
  query: string
  status: NoteStatus | "all"
}

export type NotesWorkbenchView = {
  filters: NotesFilterState
  filteredNotes: NoteRecord[]
  totalNotes: number
}
