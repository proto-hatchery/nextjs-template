export type DocumentStatus = "Draft" | "Needs review" | "Shared"
export type DocumentKind = "Consent" | "Care plan" | "Invoice" | "Assessment"

export type DocumentRecord = {
  id: string
  patientId: string
  patientName: string
  title: string
  kind: DocumentKind
  status: DocumentStatus
  updatedAt: string
  summary: string
  blocks: string[]
}

export type DocumentsFilterState = {
  query: string
  status: DocumentStatus | "all"
}

export type DocumentsLibraryView = {
  filters: DocumentsFilterState
  filteredDocuments: DocumentRecord[]
  totalDocuments: number
}
