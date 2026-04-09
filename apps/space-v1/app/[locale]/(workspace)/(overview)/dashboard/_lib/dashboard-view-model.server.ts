import "server-only"

import { getPatientDirectoryView } from "@/app/[locale]/(workspace)/(care)/patients/_lib/patient-view-model.server"
import { getSessionsBoardView } from "@/app/[locale]/(workspace)/(care)/sessions/_lib/session-view-model.server"
import { getBillingOverviewView } from "@/app/[locale]/(workspace)/(operations)/billing/_lib/billing-view-model.server"
import { getDocumentsLibraryView } from "@/app/[locale]/(workspace)/(operations)/documents/_lib/document-view-model.server"
import { getNotesWorkbenchView } from "@/app/[locale]/(workspace)/(operations)/notes/_lib/note-view-model.server"

import type { DashboardAlert, DashboardFocusArea, DashboardMetric, DashboardOverviewView } from "@/app/[locale]/(workspace)/(overview)/dashboard/_lib/dashboard-types"

function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`
}

function buildMetrics(input: {
  activePatients: number
  upcomingSessions: number
  actionItems: number
}): DashboardMetric[] {
  return [
    {
      label: "Active patients",
      value: String(input.activePatients),
      context: "Patients currently in active care across the connected workspace.",
    },
    {
      label: "Upcoming sessions",
      value: String(input.upcomingSessions),
      context: "Sessions already visible through the real shared clinical-session surface.",
    },
    {
      label: "Items needing action",
      value: String(input.actionItems),
      context: "Notes, documents, billing follow-up, and patient follow-up that still need attention.",
    },
  ]
}

function buildAlerts(input: {
  awaitingNotes: number
  needsFollowUp: number
  notesNeedingReview: number
  documentsNeedingReview: number
  pendingCharges: number
}): DashboardAlert[] {
  const alerts: DashboardAlert[] = []

  if (input.awaitingNotes > 0) {
    alerts.push({
      id: "sessions-awaiting-notes",
      title: `${pluralize(input.awaitingNotes, "session", "sessions")} still await notes`,
      description: "The session board owns note follow-up, but the dashboard should keep that pressure visible.",
      tone: "destructive",
      actionLabel: "Review sessions",
      href: "/sessions",
    })
  }

  if (input.needsFollowUp > 0) {
    alerts.push({
      id: "patients-follow-up",
      title: `${pluralize(input.needsFollowUp, "patient", "patients")} need follow-up`,
      description: "Patients remain the source of truth for care continuity, while the overview keeps the resumption risk visible.",
      tone: "default",
      actionLabel: "Open patients",
      href: "/patients?status=Needs+follow-up&sort=recent-activity",
    })
  }

  if (input.notesNeedingReview > 0) {
    alerts.push({
      id: "notes-review",
      title: `${pluralize(input.notesNeedingReview, "note", "notes")} need review`,
      description: "The notes workbench now reads real data, so review pressure can be surfaced safely here.",
      tone: "default",
      actionLabel: "Open notes",
      href: "/notes?status=Needs+review",
    })
  }

  if (input.documentsNeedingReview > 0) {
    alerts.push({
      id: "documents-review",
      title: `${pluralize(input.documentsNeedingReview, "document", "documents")} need document review`,
      description: "Document detail and focused editing stay in their own routes, while the overview only exposes the queue.",
      tone: "default",
      actionLabel: "Open documents",
      href: "/documents?status=Needs+review",
    })
  }

  if (input.pendingCharges > 0) {
    alerts.push({
      id: "billing-pending",
      title: `${pluralize(input.pendingCharges, "charge", "charges")} are still pending`,
      description: "Billing remains operational and route-local, but unresolved payment follow-up belongs on the workspace landing surface.",
      tone: "default",
      actionLabel: "Open billing",
      href: "/billing",
    })
  }

  return alerts.slice(0, 4)
}

function buildFocusAreas(input: {
  activePatients: number
  upcomingSessions: number
  documentsNeedingReview: number
  pendingCharges: number
}): DashboardFocusArea[] {
  return [
    {
      id: "care",
      title: "Care continuity",
      summary: `${pluralize(input.activePatients, "patient", "patients")} remain in active care, with follow-up risk tracked in the patient directory rather than duplicated here.`,
    },
    {
      id: "sessions",
      title: "Session readiness",
      summary: `${pluralize(input.upcomingSessions, "upcoming session", "upcoming sessions")} are currently visible, so the landing surface can point back into the board before documentation falls behind.`,
    },
    {
      id: "operations",
      title: "Operational hygiene",
      summary: `${pluralize(input.documentsNeedingReview + input.pendingCharges, "item", "items")} across documents and billing still need operational follow-up.`,
    },
  ]
}

export async function getDashboardOverviewView(): Promise<DashboardOverviewView> {
  const [patientsView, sessionsView, notesView, documentsView, billingView] = await Promise.all([
    getPatientDirectoryView({ query: "", status: "all", sort: "recent-activity" }),
    getSessionsBoardView(),
    getNotesWorkbenchView({ query: "", status: "all" }),
    getDocumentsLibraryView({ query: "", status: "all" }),
    getBillingOverviewView(),
  ])

  const activePatients = patientsView.filteredPatients.filter(
    (patient) => patient.status === "Active care"
  ).length
  const needsFollowUp = patientsView.filteredPatients.filter(
    (patient) => patient.status === "Needs follow-up"
  ).length
  const upcomingSessions =
    sessionsView.groupedSessions.find((group) => group.status === "Upcoming")?.items ?? []
  const awaitingNotes =
    sessionsView.groupedSessions.find((group) => group.status === "Awaiting notes")?.items ?? []
  const notesNeedingReview = notesView.filteredNotes.filter(
    (note) => note.status === "Needs review"
  ).length
  const documentsNeedingReview = documentsView.filteredDocuments.filter(
    (document) => document.status === "Needs review"
  ).length
  const pendingCharges = billingView.queue.filter((entry) => entry.status === "Pending").length

  const agenda = upcomingSessions.slice(0, 3).map((session) => ({
    id: session.id,
    startsAt: session.startsAt,
    title: session.title,
    patientName: session.patientName,
    format: session.format,
    note: session.focus,
    href: `/sessions/${session.id}`,
  }))

  const actionItems =
    needsFollowUp +
    awaitingNotes.length +
    notesNeedingReview +
    documentsNeedingReview +
    pendingCharges

  return {
    metrics: buildMetrics({
      activePatients,
      upcomingSessions: upcomingSessions.length,
      actionItems,
    }),
    agenda,
    alerts: buildAlerts({
      awaitingNotes: awaitingNotes.length,
      needsFollowUp,
      notesNeedingReview,
      documentsNeedingReview,
      pendingCharges,
    }),
    focusAreas: buildFocusAreas({
      activePatients,
      upcomingSessions: upcomingSessions.length,
      documentsNeedingReview,
      pendingCharges,
    }),
  }
}
