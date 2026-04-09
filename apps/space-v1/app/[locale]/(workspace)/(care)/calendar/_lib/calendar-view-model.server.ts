import "server-only"

import {
  getNormalizedSchedulingFoundation,
  type NormalizedScheduledItem,
} from "@workspace/supabase-data/lib/scheduling/get-normalized-scheduling-foundation"

import type {
  CalendarAgendaItem,
  CalendarFilterState,
  CalendarKindFilter,
  CalendarLegendItem,
  CalendarMetric,
  CalendarMonthDay,
  CalendarSyncCard,
  CalendarWorkspaceView,
} from "@/app/[locale]/(workspace)/(care)/calendar/_lib/calendar-types"

type CalendarPageSearchParams = {
  date?: string
  view?: string
  kind?: string
}

function asDate(value: string | undefined) {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function _addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

function sameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function parseKindFilter(value: string | undefined): CalendarKindFilter {
  if (
    value === "clinical-session" ||
    value === "meeting" ||
    value === "supervision" ||
    value === "block" ||
    value === "other"
  ) {
    return value
  }

  return "all"
}

function parseViewMode(value: string | undefined): CalendarFilterState["view"] {
  return value === "day" ? "day" : "month"
}

function getFilterState(searchParams: CalendarPageSearchParams): CalendarFilterState {
  const today = startOfDay(new Date())
  const selectedDate = startOfDay(asDate(searchParams.date) ?? today)

  return {
    date: toIsoDate(selectedDate),
    view: parseViewMode(searchParams.view),
    kind: parseKindFilter(searchParams.kind),
  }
}

function itemTimestamp(item: NormalizedScheduledItem) {
  if (!item.startsAt) {
    return Number.MAX_SAFE_INTEGER
  }

  const parsed = new Date(item.startsAt)
  return Number.isNaN(parsed.getTime()) ? Number.MAX_SAFE_INTEGER : parsed.getTime()
}

function itemDate(item: NormalizedScheduledItem) {
  if (!item.startsAt) {
    return null
  }

  const parsed = new Date(item.startsAt)
  return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed)
}

function titleCaseKind(kind: NormalizedScheduledItem["kind"]) {
  if (kind === "clinical-session") {
    return "Clinical session"
  }

  return kind.charAt(0).toUpperCase() + kind.slice(1)
}

function formatWhen(item: NormalizedScheduledItem) {
  if (!item.startsAt) {
    return "Schedule pending"
  }

  const parsed = new Date(item.startsAt)

  if (Number.isNaN(parsed.getTime())) {
    return item.startsAt
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: item.allDay ? undefined : "2-digit",
    minute: item.allDay ? undefined : "2-digit",
  }).format(parsed)
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(date)
}

function formatSelectedDateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(date)
}

function filterItems(
  items: NormalizedScheduledItem[],
  kind: CalendarKindFilter
) {
  if (kind === "all") {
    return items
  }

  return items.filter((item) => item.kind === kind)
}

function buildMetrics(
  foundation: Awaited<ReturnType<typeof getNormalizedSchedulingFoundation>>,
  filteredItems: NormalizedScheduledItem[]
): CalendarMetric[] {
  const selectedSessions = filteredItems.filter((item) => item.kind === "clinical-session").length
  const blockedItems = filteredItems.filter((item) => item.kind === "block").length

  return [
    {
      label: "Visible scheduled items",
      value: String(filteredItems.length),
      context: "Read-only scheduled items currently visible through the normalized calendar surface.",
    },
    {
      label: "Session-linked items",
      value: String(selectedSessions),
      context: "Clinical sessions remain the largest calendar workload, but no longer own the temporal surface directly.",
    },
    {
      label: "Blocks and overlays",
      value: String(blockedItems + foundation.compatibility.busySlotsCount),
      context: "Blocked time and busy overlays stay visible without turning this phase into an availability editor.",
    },
  ]
}

function buildLegend(filteredItems: NormalizedScheduledItem[]): CalendarLegendItem[] {
  const counts = {
    sessions: filteredItems.filter((item) => item.kind === "clinical-session").length,
    meetings: filteredItems.filter((item) => item.kind === "meeting").length,
    supervisions: filteredItems.filter((item) => item.kind === "supervision").length,
    blocks: filteredItems.filter((item) => item.kind === "block").length,
    other: filteredItems.filter((item) => item.kind === "other").length,
  }

  return [
    { label: "Sessions", count: counts.sessions, tone: counts.sessions > 0 ? "default" : "muted" },
    { label: "Meetings", count: counts.meetings, tone: counts.meetings > 0 ? "default" : "muted" },
    { label: "Supervisions", count: counts.supervisions, tone: counts.supervisions > 0 ? "default" : "muted" },
    { label: "Blocks", count: counts.blocks, tone: counts.blocks > 0 ? "default" : "muted" },
    { label: "Other", count: counts.other, tone: counts.other > 0 ? "default" : "muted" },
  ]
}

function buildMonthDays(
  monthDate: Date,
  selectedDate: Date,
  filteredItems: NormalizedScheduledItem[]
): CalendarMonthDay[] {
  const monthStart = startOfMonth(monthDate)
  const gridStart = addDays(monthStart, -monthStart.getDay())
  const today = startOfDay(new Date())

  return Array.from({ length: 42 }, (_, index) => {
    const day = addDays(gridStart, index)
    const items = filteredItems.filter((item) => {
      const date = itemDate(item)
      return date ? sameDay(date, day) : false
    })

    return {
      isoDate: toIsoDate(day),
      dayNumber: day.getDate(),
      isCurrentMonth: day.getMonth() === monthDate.getMonth(),
      isToday: sameDay(day, today),
      isSelected: sameDay(day, selectedDate),
      totalItems: items.length,
      sessionItems: items.filter((item) => item.kind === "clinical-session").length,
      blockedItems: items.filter((item) => item.kind === "block").length,
    }
  })
}

function buildAgenda(
  selectedDate: Date,
  filteredItems: NormalizedScheduledItem[]
): CalendarAgendaItem[] {
  return filteredItems
    .filter((item) => {
      const date = itemDate(item)
      return date ? sameDay(date, selectedDate) : false
    })
    .sort((left, right) => itemTimestamp(left) - itemTimestamp(right))
    .map((item) => ({
      id: item.id,
      title: item.title,
      when: formatWhen(item),
      kind: titleCaseKind(item.kind),
      patientName: item.patientName,
      status: item.status,
      serviceName: item.serviceName,
      location: item.location,
    }))
}

function buildCompatibilityIssues(
  foundation: Awaited<ReturnType<typeof getNormalizedSchedulingFoundation>>
) {
  const issues = []

  if (foundation.compatibility.recurringSeriesCount > 0) {
    issues.push({
      id: "recurring-series",
      title: `${foundation.compatibility.recurringSeriesCount} recurring series remain independently modeled`,
      detail: "Recurring behavior stays calendar-native for now, which is why event creation and availability editing remain later phases.",
    })
  }

  if (issues.length === 0) {
    issues.push({
      id: "compatibility-stable",
      title: "The scheduling compatibility layer is currently stable",
      detail: "The calendar UI can remain read-first while deeper temporal-model work is deferred.",
    })
  }

  return issues
}

function buildAvailabilityHighlights(
  foundation: Awaited<ReturnType<typeof getNormalizedSchedulingFoundation>>,
  monthDate: Date
) {
  const monthPrefix = `${monthDate.getFullYear()}-${pad(monthDate.getMonth() + 1)}`
  const relevantExceptions = foundation.availabilityExceptions.filter((item) =>
    item.date?.startsWith(monthPrefix)
  )

  const highlights = [
    `${relevantExceptions.length} availability exception${relevantExceptions.length === 1 ? "" : "s"} fall inside the visible month.`,
    `${foundation.compatibility.busySlotsCount} busy-slot overlay${foundation.compatibility.busySlotsCount === 1 ? "" : "s"} remain separate from scheduled events.`,
  ]

  const firstException = relevantExceptions[0]
  if (firstException?.date) {
    highlights.push(
      `Next visible availability exception: ${firstException.date}${firstException.reason ? ` • ${firstException.reason}` : ""}.`
    )
  }

  return highlights
}

function buildSyncCards(
  foundation: Awaited<ReturnType<typeof getNormalizedSchedulingFoundation>>
): CalendarSyncCard[] {
  if (foundation.googleConnections.length === 0) {
    return [
      {
        title: "No Google Calendar connection found",
        detail: "External sync remains a separate concern and should stay read-only until the calendar workspace is more mature.",
      },
    ]
  }

  return foundation.googleConnections.slice(0, 2).map((connection) => ({
    title: connection.googleEmail ?? "Connected calendar",
    detail: connection.isConnected
      ? `Sync ${connection.syncEnabled ? "enabled" : "disabled"} • sessions ${connection.syncSessions ? "included" : "not included"} • state ${connection.syncState ?? "unknown"}`
      : connection.lastSyncError
        ? `Connection requires attention: ${connection.lastSyncError}`
        : "Connection record exists but is not currently active.",
  }))
}

export async function getCalendarWorkspaceView(
  searchParams: CalendarPageSearchParams
): Promise<CalendarWorkspaceView> {
  const foundation = await getNormalizedSchedulingFoundation()
  const filters = getFilterState(searchParams)
  const selectedDate = startOfDay(new Date(filters.date))
  const monthDate = startOfMonth(selectedDate)
  const filteredItems = filterItems(foundation.scheduledItems, filters.kind)

  return {
    filters,
    metrics: buildMetrics(foundation, filteredItems),
    monthLabel: formatMonthLabel(monthDate),
    selectedDateLabel: formatSelectedDateLabel(selectedDate),
    ownershipSummary:
      "Calendar events currently own time and recurrence; clinical sessions enrich workflow state; availability and sync remain contextual overlays.",
    legend: buildLegend(filteredItems),
    monthDays: buildMonthDays(monthDate, selectedDate, filteredItems),
    agenda: buildAgenda(selectedDate, filteredItems),
    emptyAgendaMessage:
      filters.kind === "all"
        ? "No scheduled items fall on the selected day yet."
        : `No ${filters.kind.replace("-", " ")} items fall on the selected day yet.`,
    compatibilityIssues: buildCompatibilityIssues(foundation),
    availabilityHighlights: buildAvailabilityHighlights(foundation, monthDate),
    syncCards: buildSyncCards(foundation),
  }
}
