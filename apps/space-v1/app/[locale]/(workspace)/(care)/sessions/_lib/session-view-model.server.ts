import "server-only"
import type {
  SessionChecklistItem,
  SessionRecord,
  SessionStatus,
  SessionsBoardView,
} from "@/app/[locale]/(workspace)/(care)/sessions/_lib/session-types"
import { findByIdTherapeuticSessionEventsAction } from "@workspace/supabase-data/actions/clinical-sessions/therapeutic-session-events-findById.codegen"
import { listTherapeuticSessionEventsAction } from "@workspace/supabase-data/actions/clinical-sessions/therapeutic-session-events-list.codegen"
import { listPsychologistNotesAction } from "@workspace/supabase-data/actions/notes/psychologist-notes-list.codegen"
import type { TherapeuticSessionEventsDTO } from "@workspace/supabase-data/modules/clinical-sessions/domain/dto/therapeutic-session-events.dto.codegen"
import type { PsychologistNotesDTO } from "@workspace/supabase-data/modules/notes/domain/dto/psychologist-notes.dto.codegen"

function asString(value: unknown) {
  return typeof value === "string" ? value : null
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : null
}

function asBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function formatDateTimeLabel(value: unknown, emptyLabel: string) {
  const dateValue = asString(value)

  if (!dateValue) {
    return emptyLabel
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

function getSessionTimestamp(value: unknown) {
  const dateValue = asString(value)

  if (!dateValue) {
    return 0
  }

  const parsed = new Date(dateValue)

  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime()
}

function buildNoteIndex(notes: PsychologistNotesDTO[]) {
  const byClinicalSessionId = new Map<string, PsychologistNotesDTO[]>()

  for (const note of notes) {
    const sessionId = normalizeText(note.sessionId)
    if (!sessionId) {
      continue
    }

    const current = byClinicalSessionId.get(sessionId) ?? []
    current.push(note)
    byClinicalSessionId.set(sessionId, current)
  }

  return byClinicalSessionId
}

function hasLinkedNote(
  event: TherapeuticSessionEventsDTO,
  notesByClinicalSessionId: Map<string, PsychologistNotesDTO[]>
) {
  const clinicalSessionId = normalizeText(event.clinicalSessionId)
  if (!clinicalSessionId) {
    return false
  }

  return (notesByClinicalSessionId.get(clinicalSessionId)?.length ?? 0) > 0
}

function resolveSessionStatus(
  event: TherapeuticSessionEventsDTO,
  notesByClinicalSessionId: Map<string, PsychologistNotesDTO[]>
): SessionStatus {
  const rawStatus = asString(event.schedulingStatus)?.toLowerCase() ?? ""

  if (
    rawStatus.includes("completed") ||
    rawStatus.includes("done") ||
    rawStatus.includes("finished")
  ) {
    return "Completed"
  }

  if (hasLinkedNote(event, notesByClinicalSessionId)) {
    return "Awaiting notes"
  }

  return "Upcoming"
}

function buildChecklist(
  event: TherapeuticSessionEventsDTO,
  notesByClinicalSessionId: Map<string, PsychologistNotesDTO[]>
): SessionChecklistItem[] {
  return [
    {
      id: `${event.calendarEventId}-attendance`,
      label: "Attendance confirmed",
      done: asBoolean(event.attendanceConfirmed) === true,
    },
    {
      id: `${event.calendarEventId}-note`,
      label: "Documentation linked",
      done: hasLinkedNote(event, notesByClinicalSessionId),
    },
    {
      id: `${event.calendarEventId}-billing`,
      label: "Billing status captured",
      done: Boolean(asString(event.billingStatus)),
    },
  ]
}

function buildRecap(event: TherapeuticSessionEventsDTO, patientName: string) {
  const recap = [
    `This session is linked to ${patientName}.`,
    `Billing status is currently ${asString(event.billingStatus) ?? "not defined"}.`,
  ]

  const schedulingStatus = asString(event.schedulingStatus)
  if (schedulingStatus) {
    recap.push(`Scheduling status: ${schedulingStatus}.`)
  }

  return recap
}

function buildNextActions(
  event: TherapeuticSessionEventsDTO,
  status: SessionStatus,
  notesByClinicalSessionId: Map<string, PsychologistNotesDTO[]>
) {
  const actions = new Set<string>()

  if (status === "Awaiting notes") {
    actions.add("Review session notes and decide whether a formal note should be linked.")
  }

  if (status === "Upcoming") {
    actions.add("Confirm attendance and session preparation before the scheduled start.")
  }

  if (!hasLinkedNote(event, notesByClinicalSessionId)) {
    actions.add("Open the notes workspace and connect documentation to this scheduled session.")
  }

  if (!asString(event.billingStatus)) {
    actions.add("Capture billing status after the session workflow advances.")
  }

  actions.add("Keep note and billing follow-up inside their own route trees during later phases.")

  return [...actions]
}

function mapCalendarEventToSessionRecord(
  event: TherapeuticSessionEventsDTO,
  notesByClinicalSessionId: Map<string, PsychologistNotesDTO[]>
): SessionRecord {
  const patientId = asString(event.psychologistPatientId) ?? ""
  const patientName =
    asString(event.patientDisplayName) ?? asString(event.patientName) ?? "Linked patient"
  const status = resolveSessionStatus(event, notesByClinicalSessionId)
  const sessionNumber = asNumber(event.sessionNumber)
  const title =
    asString(event.serviceName) ?? (sessionNumber ? `Session ${sessionNumber}` : "Clinical session")
  const location = normalizeText(event.location)
  const hasLocation = location.length > 0
  const noteLinked = hasLinkedNote(event, notesByClinicalSessionId)

  return {
    id: String(event.calendarEventId),
    title,
    patientId,
    patientName,
    startsAt: formatDateTimeLabel(event.startDatetime, "Schedule pending"),
    status,
    format: hasLocation ? location : "Remote / undefined",
    duration: `${asNumber(event.durationMinutes) ?? 50} min`,
    noteState: noteLinked ? "Documentation linked" : "Awaiting documentation",
    focus:
      asString(event.privateNotes) ??
      asString(event.description) ??
      `Continue the care rhythm for ${patientName} and keep the session outcome traceable.`,
    checklist: buildChecklist(event, notesByClinicalSessionId),
    recap: buildRecap(event, patientName),
    nextActions: buildNextActions(event, status, notesByClinicalSessionId),
  }
}

export async function getSessionsBoardView(): Promise<SessionsBoardView> {
  const [eventsResult, notesResult] = await Promise.all([
    listTherapeuticSessionEventsAction({ limit: 100, offset: 0 }),
    listPsychologistNotesAction({ limit: 100, offset: 0 }),
  ])
  const notesByClinicalSessionId = buildNoteIndex(notesResult.rows)

  const records = eventsResult.rows
    .map((event) => ({
      record: mapCalendarEventToSessionRecord(event, notesByClinicalSessionId),
      timestamp: getSessionTimestamp(event.startDatetime),
    }))
    .toSorted((left, right) => right.timestamp - left.timestamp)
    .map(({ record }) => record)

  const statusOrder: SessionStatus[] = ["Upcoming", "Awaiting notes", "Completed"]

  return {
    groupedSessions: statusOrder.map((status) => ({
      status,
      items: records.filter((record) => record.status === status),
    })),
    operationalNotes: [
      "Sessions now read from the dedicated therapeutic-session event view backed by calendar_events.",
      "Session routes now resolve only canonical calendar event identifiers.",
    ],
  }
}

export async function getSessionRecordById(sessionId: string) {
  if (!isUuid(sessionId)) {
    return null
  }

  const sessionEvent = await findByIdTherapeuticSessionEventsAction({ calendarEventId: sessionId })
  if (!sessionEvent) {
    return null
  }

  const notesResult = await listPsychologistNotesAction({ limit: 100, offset: 0 })
  const notesByClinicalSessionId = buildNoteIndex(notesResult.rows)

  return mapCalendarEventToSessionRecord(sessionEvent, notesByClinicalSessionId)
}
