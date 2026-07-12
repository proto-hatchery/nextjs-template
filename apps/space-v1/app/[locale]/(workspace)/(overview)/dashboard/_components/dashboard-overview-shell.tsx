"use client"

import type { DashboardOverviewView } from "@/app/[locale]/(workspace)/(overview)/dashboard/_lib/dashboard-types"
import { AppShellPage } from "@/app/[locale]/(workspace)/_components/app-shell-page"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

type DashboardOverviewShellProps = {
  overview: DashboardOverviewView
}

export function DashboardOverviewShell({ overview }: DashboardOverviewShellProps) {
  const t = useTranslations("Dashboard")

  return (
    <AppShellPage>
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">{t("eyebrow")}</p>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">{t("intro")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {overview.metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="space-y-1">
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-3xl">{metric.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">{metric.context}</CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t("todayTitle")}</CardTitle>
            <CardDescription>{t("todayDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {overview.agenda.length === 0 ? (
              <div className="space-y-2 rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm font-medium">{t("emptyAgendaTitle")}</p>
                <p className="text-muted-foreground text-sm">{t("emptyAgendaDescription")}</p>
              </div>
            ) : (
              overview.agenda.map((item) => (
                <div key={item.id} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-muted-foreground text-sm">{item.patientName}</p>
                    </div>
                    <Badge variant="outline">{item.startsAt}</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">{item.note}</p>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground text-xs tracking-[0.16em] uppercase">
                      {item.format}
                    </span>
                    <Button asChild size="sm" variant="outline">
                      <Link href={item.href}>{t("openSession")}</Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actionable alerts</CardTitle>
              <CardDescription>
                Static for now, but shaped like a future summary contract rather than a generic
                placeholder card.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview.alerts.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4">
                  <p className="text-sm font-medium">No urgent alerts right now</p>
                  <p className="text-muted-foreground mt-2 text-sm">
                    The overview will surface cross-domain pressure here when care or operations
                    queues start to drift.
                  </p>
                </div>
              ) : (
                overview.alerts.map((alert) => (
                  <div key={alert.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <Badge variant={alert.tone === "destructive" ? "destructive" : "secondary"}>
                        {alert.tone === "destructive" ? "Needs action" : "Monitor"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm">{alert.description}</p>
                    <Button asChild size="sm" variant="ghost" className="mt-3 px-0">
                      <Link href={alert.href}>{alert.actionLabel}</Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Focus areas</CardTitle>
              <CardDescription>
                A simple migration blueprint: overview routes summarize, domain routes own detail.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview.focusAreas.map((area) => (
                <div key={area.id} className="rounded-lg border p-4">
                  <p className="text-sm font-medium">{area.title}</p>
                  <p className="text-muted-foreground mt-2 text-sm">{area.summary}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShellPage>
  )
}
