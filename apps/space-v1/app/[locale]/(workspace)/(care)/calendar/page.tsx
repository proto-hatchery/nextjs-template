import { CalendarWorkspaceFilters } from "@/app/[locale]/(workspace)/(care)/calendar/_components/calendar-workspace-filters"
import { CalendarWorkspaceShell } from "@/app/[locale]/(workspace)/(care)/calendar/_components/calendar-workspace-shell"
import { getCalendarWorkspaceView } from "@/app/[locale]/(workspace)/(care)/calendar/_lib/calendar-view-model.server"
import { AppShellPage } from "@/app/[locale]/(workspace)/_components/app-shell-page"

type CalendarPageSearchParams = {
  date?: string
  view?: string
  kind?: string
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<CalendarPageSearchParams>
}) {
  const resolvedSearchParams = await searchParams
  const view = await getCalendarWorkspaceView(resolvedSearchParams)
  const selectedDate = new Date(`${view.filters.date}T12:00:00`)
  const currentMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
  const baseQuery = `kind=${view.filters.kind}${view.filters.view === "day" ? "&view=day" : ""}`
  const previousMonthHref = `/calendar?date=${toIsoDate(previousMonth)}&${baseQuery}`
  const nextMonthHref = `/calendar?date=${toIsoDate(nextMonth)}&${baseQuery}`
  const todayHref = `/calendar?date=${toIsoDate(new Date())}&${baseQuery}`

  return (
    <AppShellPage>
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
          Scheduling foundation
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
          A real read-only calendar workspace now sits on top of the normalized scheduling model,
          so sessions, meetings, blocks, availability overlays, and sync context can be reviewed
          together without reintroducing ownership ambiguity.
        </p>
      </div>
      <CalendarWorkspaceFilters filters={view.filters} />
      <CalendarWorkspaceShell
        view={view}
        previousMonthHref={previousMonthHref}
        nextMonthHref={nextMonthHref}
        todayHref={todayHref}
      />
    </AppShellPage>
  )
}
