import { Link } from "@/i18n/navigation"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import type { CalendarWorkspaceView } from "@/app/[locale]/(workspace)/(care)/calendar/_lib/calendar-types"

type CalendarWorkspaceShellProps = {
  view: CalendarWorkspaceView
  previousMonthHref: string
  nextMonthHref: string
  todayHref: string
}

export function CalendarWorkspaceShell({
  view,
  previousMonthHref,
  nextMonthHref,
  todayHref,
}: CalendarWorkspaceShellProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {view.metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="space-y-1">
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-2xl">{metric.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{metric.context}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle>{view.monthLabel}</CardTitle>
              <CardDescription>{view.ownershipSummary}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={previousMonthHref}>Previous month</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={todayHref}>Today</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={nextMonthHref}>Next month</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {view.legend.map((item) => (
                <Badge key={item.label} variant={item.tone === "default" ? "secondary" : "outline"}>
                  {item.label}: {item.count}
                </Badge>
              ))}
            </div>

            {view.filters.view === "month" ? (
              <div className="grid grid-cols-7 gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
                  <div
                    key={label}
                    className="text-muted-foreground px-2 py-1 text-center text-xs font-medium uppercase"
                  >
                    {label}
                  </div>
                ))}

                {view.monthDays.map((day) => (
                  <Button
                    key={day.isoDate}
                    asChild
                    variant={day.isSelected ? "default" : "outline"}
                    className={[
                      "h-auto min-h-24 items-start justify-start p-0",
                      !day.isCurrentMonth ? "opacity-45" : "",
                    ].join(" ")}
                  >
                    <Link href={`/calendar?date=${day.isoDate}&kind=${view.filters.kind}${view.filters.view === "day" ? "&view=day" : ""}`}>
                      <div className="flex h-full w-full flex-col gap-3 p-3 text-left">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">{day.dayNumber}</span>
                          {day.isToday ? <Badge variant="secondary">Today</Badge> : null}
                        </div>
                        <div className="space-y-1 text-xs">
                          <p>{day.totalItems} scheduled</p>
                          {day.sessionItems > 0 ? <p>{day.sessionItems} sessions</p> : null}
                          {day.blockedItems > 0 ? <p>{day.blockedItems} blocks</p> : null}
                        </div>
                      </div>
                    </Link>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {view.agenda.length > 0 ? (
                  view.agenda.map((item) => (
                    <div key={item.id} className="rounded-xl border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-medium">{item.title}</p>
                        <Badge variant="outline">{item.kind}</Badge>
                      </div>
                      <div className="text-muted-foreground mt-3 space-y-1 text-sm">
                        <p>{item.when}</p>
                        {item.patientName ? <p>Patient: {item.patientName}</p> : null}
                        {item.serviceName ? <p>Service: {item.serviceName}</p> : null}
                        {item.location ? <p>Location: {item.location}</p> : null}
                        {item.status ? <p>Status: {item.status}</p> : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                    {view.emptyAgendaMessage}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{view.selectedDateLabel}</CardTitle>
              <CardDescription>
                Selected-day agenda derived from the normalized scheduling surface.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {view.agenda.length > 0 ? (
                view.agenda.map((item) => (
                  <div key={item.id} className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium">{item.title}</p>
                      <span className="text-muted-foreground text-xs">{item.kind}</span>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm">{item.when}</p>
                    {item.patientName ? (
                      <p className="text-muted-foreground mt-1 text-sm">Patient: {item.patientName}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  {view.emptyAgendaMessage}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Availability context</CardTitle>
              <CardDescription>
                Visibility only for now. Editing remains a later scheduling phase.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {view.availabilityHighlights.map((item) => (
                <div key={item} className="rounded-lg border p-4">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Google sync context</CardTitle>
              <CardDescription>
                External sync state remains visible without introducing sync actions yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {view.syncCards.map((card) => (
                <div key={card.title} className="rounded-lg border p-4">
                  <p className="text-sm font-medium">{card.title}</p>
                  <p className="text-muted-foreground mt-2 text-sm">{card.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scheduling watchlist</CardTitle>
              <CardDescription>
                Keep the compatibility boundary visible while the calendar UI grows.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {view.compatibilityIssues.map((issue) => (
                <div key={issue.id} className="rounded-lg border p-4">
                  <p className="text-sm font-medium">{issue.title}</p>
                  <p className="text-muted-foreground mt-2 text-sm">{issue.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
