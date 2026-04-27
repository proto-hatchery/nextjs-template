import "server-only"
import type {
  PatientDirectoryFilterState,
  PatientDirectoryView,
  PatientProfile,
  PatientStatus,
  PatientSummaryMetric,
  PatientTimelineEntry,
} from "@/app/[locale]/(workspace)/(care)/patients/_lib/patient-types"
import { findByIdPsychologistPatientsAction } from "@workspace/supabase-data/actions/patients/psychologist-patients-findById.codegen"
import { listPsychologistPatientsAction } from "@workspace/supabase-data/actions/patients/psychologist-patients-list.codegen"
import type { PsychologistPatientsDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patients.dto.codegen"

function asString(value: unknown) {
  return typeof value === "string" ? value : null
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : null
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function getPatientDisplayName(patient: PsychologistPatientsDTO) {
  return (
    asString(patient.syncedDisplayName) ??
    asString(patient.manualDisplayName) ??
    asString(patient.syncedFullName) ??
    asString(patient.manualFullName) ??
    "Unnamed patient"
  )
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function formatDateLabel(value: unknown, emptyLabel: string) {
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
    year: "numeric",
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

function resolvePatientStatus(patient: PsychologistPatientsDTO): PatientStatus {
  const archivedAt = asString(patient.archivedAt)
  const relationshipEndDate = asString(patient.relationshipEndDate)
  const inviteStatus = asString(patient.inviteStatus)?.toLowerCase()
  const totalSessionsCount = asNumber(patient.totalSessionsCount) ?? 0
  const lastSessionDate = asString(patient.lastSessionDate)

  if (archivedAt || relationshipEndDate) {
    return "Stepped down"
  }

  if (inviteStatus?.includes("pending") || totalSessionsCount === 0) {
    return "Intake scheduled"
  }

  if (!lastSessionDate) {
    return "Needs follow-up"
  }

  const daysSinceLastSession =
    (Date.now() - getComparableTimestamp(lastSessionDate)) / (1000 * 60 * 60 * 24)

  if (daysSinceLastSession > 14) {
    return "Needs follow-up"
  }

  return "Active care"
}

function getPatientTags(patient: PsychologistPatientsDTO, status: PatientStatus) {
  const tags = new Set<string>()

  tags.add(status)

  const contactMethod = asString(patient.preferredContactMethod)
  if (contactMethod) {
    tags.add(contactMethod)
  }

  const riskLevel = asString(patient.riskLevel)
  if (riskLevel) {
    tags.add(`Risk: ${riskLevel}`)
  }

  const inviteStatus = asString(patient.inviteStatus)
  if (inviteStatus) {
    tags.add(`Invite: ${inviteStatus}`)
  }

  return [...tags]
}

function buildTimeline(patient: PsychologistPatientsDTO): PatientTimelineEntry[] {
  const timeline: PatientTimelineEntry[] = []

  const relationshipStartDate = asString(patient.relationshipStartDate)
  if (relationshipStartDate) {
    timeline.push({
      id: `${patient.id}-relationship-start`,
      title: "Care relationship started",
      when: formatDateLabel(relationshipStartDate, "Unknown"),
      detail: "This is the first recorded relationship milestone for the patient.",
    })
  }

  const firstSessionDate = asString(patient.firstSessionDate)
  if (firstSessionDate) {
    timeline.push({
      id: `${patient.id}-first-session`,
      title: "First session recorded",
      when: formatDateLabel(firstSessionDate, "Unknown"),
      detail: "The first session date is available from the shared patients module.",
    })
  }

  const lastSessionDate = asString(patient.lastSessionDate)
  if (lastSessionDate) {
    timeline.push({
      id: `${patient.id}-last-session`,
      title: "Most recent session",
      when: formatDateLabel(lastSessionDate, "Unknown"),
      detail:
        "The patient detail route now reflects the latest session date from real shared data.",
    })
  }

  const informedConsentDate = asString(patient.informedConsentDate)
  if (informedConsentDate) {
    timeline.push({
      id: `${patient.id}-consent`,
      title: "Informed consent registered",
      when: formatDateLabel(informedConsentDate, "Unknown"),
      detail: "Consent timing is surfaced directly from the patient record.",
    })
  }

  return timeline.length > 0
    ? timeline
    : [
        {
          id: `${patient.id}-empty`,
          title: "No timeline milestones yet",
          when: "Pending",
          detail:
            "This patient record exists, but the shared backend has not exposed milestone dates yet.",
        },
      ]
}

function buildNextSteps(patient: PsychologistPatientsDTO, status: PatientStatus) {
  const steps = new Set<string>()

  if (status === "Needs follow-up") {
    steps.add("Review follow-up cadence and confirm the next session date.")
  }

  if (status === "Intake scheduled") {
    steps.add("Finish onboarding and confirm the first consultation setup.")
  }

  if (asString(patient.therapeuticGoals)) {
    steps.add("Review therapeutic goals before the next patient-facing update.")
  }

  if (asString(patient.dataSharingConsent) !== "true") {
    steps.add("Confirm data-sharing consent and update the patient record if needed.")
  }

  steps.add("Keep note and document follow-up inside their own route trees during later phases.")

  return [...steps]
}

function buildAdministrativeMarkers(patient: PsychologistPatientsDTO) {
  const markers = [
    {
      id: `${patient.id}-invite`,
      label: "Invite status",
      value: asString(patient.inviteStatus) ?? "Not tracked",
    },
    {
      id: `${patient.id}-risk`,
      label: "Risk level",
      value: asString(patient.riskLevel) ?? "Not set",
    },
    {
      id: `${patient.id}-sessions`,
      label: "Total sessions",
      value: String(asNumber(patient.totalSessionsCount) ?? 0),
    },
    {
      id: `${patient.id}-price`,
      label: "Default session price",
      value:
        typeof patient.defaultSessionPrice === "string" ||
        typeof patient.defaultSessionPrice === "number"
          ? String(patient.defaultSessionPrice)
          : "Not defined",
    },
  ]

  return markers
}

function mapPatientDtoToProfile(patient: PsychologistPatientsDTO): PatientProfile {
  const name = getPatientDisplayName(patient)
  const status = resolvePatientStatus(patient)
  const totalSessionsCount = asNumber(patient.totalSessionsCount) ?? 0

  return {
    id: String(patient.id),
    name,
    initials: getInitials(name),
    status,
    lastSession: formatDateLabel(patient.lastSessionDate, "No completed sessions yet"),
    nextSession:
      status === "Needs follow-up"
        ? "Needs scheduling"
        : status === "Intake scheduled"
          ? "Intake not completed yet"
          : "Check sessions workspace",
    cadence:
      totalSessionsCount > 8 ? "Ongoing care" : totalSessionsCount > 0 ? "Early care" : "Intake",
    focusArea:
      asString(patient.initialComplaint) ??
      asString(patient.clinicalHypothesis) ??
      "Clinical focus pending",
    primaryGoal:
      asString(patient.therapeuticGoals) ??
      asString(patient.treatmentPlan) ??
      "No structured therapeutic goals registered yet.",
    contactPreference: asString(patient.preferredContactMethod) ?? "Not defined",
    coordinatorNote:
      asString(patient.clinicalNotes) ??
      asString(patient.treatmentPlan) ??
      "No coordinator note is available yet from the shared patient record.",
    metrics: [
      { label: "Total sessions", value: String(totalSessionsCount) },
      { label: "Risk level", value: asString(patient.riskLevel) ?? "Not set" },
      {
        label: "Consent signed",
        value: patient.informedConsentSigned === true ? "Yes" : "Pending",
      },
    ],
    tags: getPatientTags(patient, status),
    timeline: buildTimeline(patient),
    nextSteps: buildNextSteps(patient, status),
    administrativeMarkers: buildAdministrativeMarkers(patient),
  }
}

export async function getPatientDirectoryView(
  filters: PatientDirectoryFilterState
): Promise<PatientDirectoryView> {
  const result = await listPsychologistPatientsAction({ limit: 100, offset: 0 })
  const profiles = result.rows.map((row) => ({
    profile: mapPatientDtoToProfile(row),
    lastSessionTimestamp: getComparableTimestamp(row.lastSessionDate),
    relationshipStartTimestamp: getComparableTimestamp(row.relationshipStartDate),
  }))
  const normalizedQuery = filters.query.trim().toLowerCase()

  const filteredPatients = profiles
    .filter(({ profile }) => {
      const matchesStatus = filters.status === "all" || profile.status === filters.status
      const matchesQuery =
        normalizedQuery.length === 0 ||
        profile.name.toLowerCase().includes(normalizedQuery) ||
        profile.focusArea.toLowerCase().includes(normalizedQuery) ||
        profile.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))

      return matchesStatus && matchesQuery
    })
    .toSorted((left, right) => {
      switch (filters.sort) {
        case "next-session":
          return right.relationshipStartTimestamp - left.relationshipStartTimestamp
        case "recent-activity":
          return right.lastSessionTimestamp - left.lastSessionTimestamp
        case "name":
        default:
          return left.profile.name.localeCompare(right.profile.name)
      }
    })
    .map(({ profile }) => profile)

  const stats: PatientSummaryMetric[] = [
    {
      label: "In active care",
      value: String(profiles.filter(({ profile }) => profile.status === "Active care").length),
    },
    {
      label: "Need follow-up",
      value: String(profiles.filter(({ profile }) => profile.status === "Needs follow-up").length),
    },
    {
      label: "New intakes",
      value: String(profiles.filter(({ profile }) => profile.status === "Intake scheduled").length),
    },
  ]

  const attentionQueue = profiles
    .map(({ profile }) => profile)
    .filter((patient) => patient.status !== "Stepped down")
    .slice(0, 3)
    .map((patient) => {
      if (patient.status === "Needs follow-up") {
        return `Confirm the next care step for ${patient.name}.`
      }

      if (patient.status === "Intake scheduled") {
        return `Finish intake preparation and consent checks for ${patient.name}.`
      }

      return `Keep ${patient.name}'s therapeutic goals aligned with the next session.`
    })

  return {
    filters,
    filteredPatients,
    totalPatients: profiles.length,
    stats,
    attentionQueue,
  }
}

export async function getPatientProfileById(patientId: string) {
  if (!isUuid(patientId)) {
    return null
  }

  const patient = await findByIdPsychologistPatientsAction({ id: patientId })

  if (!patient) {
    return null
  }

  return mapPatientDtoToProfile(patient)
}
