import "server-only"

import {
  findByIdGeneratedDocumentsAction,
} from "@workspace/supabase-data/actions/documents/generated-documents-findById.codegen"
import {
  listGeneratedDocumentsAction,
} from "@workspace/supabase-data/actions/documents/generated-documents-list.codegen"
import {
  listPsychologistPatientsAction,
} from "@workspace/supabase-data/actions/patients/psychologist-patients-list.codegen"
import type { GeneratedDocumentsDTO } from "@workspace/supabase-data/modules/documents/domain/dto/generated-documents.dto.codegen"
import type { PsychologistPatientsDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patients.dto.codegen"

import type {
  DocumentKind,
  DocumentRecord,
  DocumentsFilterState,
  DocumentsLibraryView,
  DocumentStatus,
} from "@/app/[locale]/(workspace)/(operations)/documents/_lib/document-types"

function asString(value: unknown) {
  return typeof value === "string" ? value : null
}

function asBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )
}

function getPatientDisplayName(patient: PsychologistPatientsDTO) {
  return (
    asString(patient.syncedDisplayName) ??
    asString(patient.manualDisplayName) ??
    asString(patient.syncedFullName) ??
    asString(patient.manualFullName) ??
    "Patient"
  )
}

function formatUpdatedAt(value: unknown) {
  const dateValue = asString(value)

  if (!dateValue) {
    return "Recently updated"
  }

  const parsed = new Date(dateValue)

  if (Number.isNaN(parsed.getTime())) {
    return dateValue
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed)
}

function getComparableTimestamp(value: unknown) {
  const dateValue = asString(value)

  if (!dateValue) {
    return 0
  }

  const parsed = new Date(dateValue)

  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime()
}

function normalizeDocumentKind(value: unknown): DocumentKind {
  const rawType = (asString(value) ?? "").toLowerCase()

  if (rawType.includes("consent") || rawType.includes("authorization")) {
    return "Consent"
  }

  if (rawType.includes("invoice") || rawType.includes("billing")) {
    return "Invoice"
  }

  if (rawType.includes("plan")) {
    return "Care plan"
  }

  return "Assessment"
}

function parseTags(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return []
  }

  const trimmed = value.trim()

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed)

      if (Array.isArray(parsed)) {
        return parsed.filter((entry): entry is string => typeof entry === "string")
      }

      if (typeof parsed === "object" && parsed !== null) {
        return Object.values(parsed).filter((entry): entry is string => typeof entry === "string")
      }
    } catch {
      return trimmed
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    }
  }

  return trimmed
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function resolveDocumentStatus(document: GeneratedDocumentsDTO): DocumentStatus {
  if (asBoolean(document.isArchived) === true) {
    return "Shared"
  }

  const tags = parseTags(document.tags).map((tag) => tag.toLowerCase())

  if (tags.some((tag) => tag.includes("shared") || tag.includes("signed") || tag.includes("sent"))) {
    return "Shared"
  }

  if (tags.some((tag) => tag.includes("review") || tag.includes("approval") || tag.includes("draft-ready"))) {
    return "Needs review"
  }

  return "Draft"
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function parseBlocks(document: GeneratedDocumentsDTO) {
  const source = normalizeText(document.content) || normalizeText(document.encodedContent)

  if (!source) {
    return [
      "No structured content is available yet for this document.",
      "The route-local editor remains ready for future generation and persistence phases.",
    ]
  }

  if (source.startsWith("{") || source.startsWith("[")) {
    try {
      const parsed = JSON.parse(source)

      if (Array.isArray(parsed)) {
        const blocks = parsed.filter((entry): entry is string => typeof entry === "string")
        if (blocks.length > 0) {
          return blocks
        }
      }

      if (typeof parsed === "object" && parsed !== null) {
        const objectValues = Object.values(parsed).filter(
          (entry): entry is string => typeof entry === "string" && entry.trim().length > 0
        )

        if (objectValues.length > 0) {
          return objectValues
        }
      }
    } catch {
      return source
        .split(/\n\s*\n/)
        .map((part) => part.trim())
        .filter(Boolean)
    }
  }

  return source
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function mapDocumentDtoToRecord(
  document: GeneratedDocumentsDTO,
  patientNameById: Map<string, string>
): DocumentRecord {
  const patientId = normalizeText(document.patientId)
  const patientName = patientNameById.get(patientId) ?? "Linked patient"
  const kind = normalizeDocumentKind(document.documentType)
  const blocks = parseBlocks(document)
  const title = normalizeText(document.title) || `${kind} document`

  return {
    id: String(document.id),
    patientId,
    patientName,
    title,
    kind,
    status: resolveDocumentStatus(document),
    updatedAt: formatUpdatedAt(document.updatedAt ?? document.createdAt),
    summary:
      blocks[0] ??
      `This ${kind.toLowerCase()} document is available in the shared generated-documents surface.`,
    blocks,
  }
}

async function getPatientNameByIdMap() {
  const patients = await listPsychologistPatientsAction({ limit: 100, offset: 0 })

  return new Map(
    patients.rows
      .map((patient) => [String(patient.id), getPatientDisplayName(patient)] as const)
      .filter(([id]) => id.length > 0)
  )
}

function filterDocuments(records: DocumentRecord[], filters: DocumentsFilterState) {
  const normalizedQuery = filters.query.trim().toLowerCase()

  return records.filter((document) => {
    const matchesStatus = filters.status === "all" || document.status === filters.status
    const matchesQuery =
      normalizedQuery.length === 0 ||
      document.title.toLowerCase().includes(normalizedQuery) ||
      document.patientName.toLowerCase().includes(normalizedQuery) ||
      document.kind.toLowerCase().includes(normalizedQuery) ||
      document.summary.toLowerCase().includes(normalizedQuery)

    return matchesStatus && matchesQuery
  })
}

export async function getDocumentsLibraryView(
  filters: DocumentsFilterState
): Promise<DocumentsLibraryView> {
  const [documentsResult, patientNameById] = await Promise.all([
    listGeneratedDocumentsAction({ limit: 100, offset: 0 }),
    getPatientNameByIdMap(),
  ])

  const allDocuments = documentsResult.rows
    .map((document) => ({
      record: mapDocumentDtoToRecord(document, patientNameById),
      timestamp: getComparableTimestamp(document.updatedAt ?? document.createdAt),
    }))
    .sort((left, right) => right.timestamp - left.timestamp)
    .map(({ record }) => record)

  return {
    filters,
    filteredDocuments: filterDocuments(allDocuments, filters),
    totalDocuments: allDocuments.length,
  }
}

export async function getDocumentById(documentId: string) {
  if (!isUuid(documentId)) {
    return null
  }

  const document = await findByIdGeneratedDocumentsAction({ id: documentId })

  if (!document) {
    return null
  }

  const patientNameById = await getPatientNameByIdMap()

  return mapDocumentDtoToRecord(document, patientNameById)
}
