import "server-only"

import {
  findByIdPsychologistNotesAction,
} from "@workspace/supabase-data/actions/notes/psychologist-notes-findById.codegen"
import {
  listPsychologistNotesAction,
} from "@workspace/supabase-data/actions/notes/psychologist-notes-list.codegen"
import {
  listPsychologistPatientsAction,
} from "@workspace/supabase-data/actions/patients/psychologist-patients-list.codegen"
import type { PsychologistNotesDTO } from "@workspace/supabase-data/modules/notes/domain/dto/psychologist-notes.dto.codegen"
import type { PsychologistPatientsDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patients.dto.codegen"

import type {
  NoteRecord,
  NotesFilterState,
  NotesWorkbenchView,
  NoteSections,
  NoteStatus,
  NoteType,
} from "@/app/[locale]/(workspace)/(operations)/notes/_lib/note-types"

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

function normalizeText(value: unknown) {
  if (typeof value === "string") {
    return value.trim()
  }

  return ""
}

function _toSentenceCase(value: string) {
  if (!value) {
    return value
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

function normalizeNoteType(value: unknown): NoteType {
  const rawType = normalizeText(value).toLowerCase()

  if (rawType.includes("assessment")) {
    return "Assessment"
  }

  if (rawType.includes("progress")) {
    return "Progress"
  }

  return "Clinical"
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

function resolveNoteStatus(note: PsychologistNotesDTO): NoteStatus {
  if (asBoolean(note.isArchived) === true) {
    return "Signed"
  }

  const tags = parseTags(note.tags).map((tag) => tag.toLowerCase())

  if (tags.some((tag) => tag.includes("signed") || tag.includes("published"))) {
    return "Signed"
  }

  if (tags.some((tag) => tag.includes("review") || tag.includes("approval"))) {
    return "Needs review"
  }

  if (normalizeText(note.sessionId)) {
    return "Needs review"
  }

  return "Draft"
}

function parseSectionsFromString(content: string): NoteSections {
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)

  const summary = paragraphs[0] ?? "Continue shaping the working summary for this note."
  const observations =
    (paragraphs[1] ?? "")
      .split(/\n+/)
      .map((line) => line.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean) || []
  const plan =
    (paragraphs[2] ?? "")
      .split(/\n+/)
      .map((line) => line.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean) || []

  return {
    summary,
    observations:
      observations.length > 0
        ? observations
        : ["Review the structured observations once the full note workflow is integrated."],
    plan:
      plan.length > 0
        ? plan
        : ["Define the next clinical actions when the note is ready for sign-off."],
  }
}

function parseNoteSections(note: PsychologistNotesDTO): NoteSections {
  const content = normalizeText(note.content)

  if (!content) {
    return {
      summary: "No note content has been recorded yet.",
      observations: ["The shared note record is available, but no structured observations were found."],
      plan: ["Complete the note body before moving this slice into mutation and editor persistence phases."],
    }
  }

  if (content.startsWith("{") || content.startsWith("[")) {
    try {
      const parsed = JSON.parse(content)

      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        const summary = normalizeText((parsed as Record<string, unknown>).summary)
        const observationsSource = (parsed as Record<string, unknown>).observations
        const planSource = (parsed as Record<string, unknown>).plan

        const observations = Array.isArray(observationsSource)
          ? observationsSource.filter((entry): entry is string => typeof entry === "string")
          : []
        const plan = Array.isArray(planSource)
          ? planSource.filter((entry): entry is string => typeof entry === "string")
          : []

        return {
          summary: summary || "Structured note content is present, but the summary is still empty.",
          observations:
            observations.length > 0
              ? observations
              : ["No structured observations were found in this note payload."],
          plan:
            plan.length > 0
              ? plan
              : ["No structured plan was found in this note payload."],
        }
      }
    } catch {
      return parseSectionsFromString(content)
    }
  }

  return parseSectionsFromString(content)
}

function buildExcerpt(sections: NoteSections) {
  const firstObservation = sections.observations[0]

  if (firstObservation) {
    return firstObservation
  }

  return sections.summary
}

function buildSessionLabel(note: PsychologistNotesDTO) {
  const sessionId = normalizeText(note.sessionId)

  if (!sessionId) {
    return "Standalone note"
  }

  return `Linked session • ${sessionId.slice(0, 8)}`
}

function mapNoteDtoToRecord(
  note: PsychologistNotesDTO,
  patientNameById: Map<string, string>
): NoteRecord {
  const patientId = normalizeText(note.patientId)
  const patientName = patientNameById.get(patientId) ?? "Linked patient"
  const sections = parseNoteSections(note)
  const type = normalizeNoteType(note.noteType)
  const status = resolveNoteStatus(note)
  const title =
    normalizeText(note.title) ||
    `${type} note for ${patientName}`

  return {
    id: String(note.id),
    title,
    patientId,
    patientName,
    type,
    status,
    updatedAt: formatUpdatedAt(note.updatedAt ?? note.createdAt),
    sessionLabel: buildSessionLabel(note),
    excerpt: buildExcerpt(sections),
    sections,
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

function filterNotes(records: NoteRecord[], filters: NotesFilterState) {
  const normalizedQuery = filters.query.trim().toLowerCase()

  return records.filter((note) => {
    const matchesStatus = filters.status === "all" || note.status === filters.status
    const matchesQuery =
      normalizedQuery.length === 0 ||
      note.title.toLowerCase().includes(normalizedQuery) ||
      note.patientName.toLowerCase().includes(normalizedQuery) ||
      note.type.toLowerCase().includes(normalizedQuery) ||
      note.excerpt.toLowerCase().includes(normalizedQuery)

    return matchesStatus && matchesQuery
  })
}

export async function getNotesWorkbenchView(
  filters: NotesFilterState
): Promise<NotesWorkbenchView> {
  const [notesResult, patientNameById] = await Promise.all([
    listPsychologistNotesAction({ limit: 100, offset: 0 }),
    getPatientNameByIdMap(),
  ])

  const allNotes = notesResult.rows
    .map((note) => ({
      record: mapNoteDtoToRecord(note, patientNameById),
      timestamp: getComparableTimestamp(note.updatedAt ?? note.createdAt),
    }))
    .sort((left, right) => right.timestamp - left.timestamp)
    .map(({ record }) => record)

  return {
    filters,
    filteredNotes: filterNotes(allNotes, filters),
    totalNotes: allNotes.length,
  }
}

export async function getNoteById(noteId: string) {
  if (!isUuid(noteId)) {
    return null
  }

  const note = await findByIdPsychologistNotesAction({ id: noteId })

  if (!note) {
    return null
  }

  const patientNameById = await getPatientNameByIdMap()

  return mapNoteDtoToRecord(note, patientNameById)
}
