import { SessionStatusBadge } from "@/app/[locale]/(workspace)/(care)/sessions/_components/session-status-badge"
import type { SessionRecord } from "@/app/[locale]/(workspace)/(care)/sessions/_lib/session-types"
import { AppShellPage } from "@/app/[locale]/(workspace)/_components/app-shell-page"
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

type SessionDetailShellProps = {
  session: SessionRecord
}

export function SessionDetailShell({ session }: SessionDetailShellProps) {
  return (
    <AppShellPage>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
              Session workbench
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">{session.title}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SessionStatusBadge status={session.status} />
            <Badge variant="outline">{session.startsAt}</Badge>
            <Badge variant="ghost">{session.format}</Badge>
            <Badge variant="ghost">{session.duration}</Badge>
          </div>
          <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">{session.focus}</p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/sessions">Back to sessions</Link>
          </Button>
          <Button asChild>
            <Link href={`/patients/${session.patientId}`}>Open patient</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session context</CardTitle>
              <CardDescription>
                A route-local workbench structure that can later absorb notes, recordings, and
                session artifacts without changing the route tree.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1 rounded-lg border p-4">
                <p className="text-muted-foreground text-sm">Patient</p>
                <p className="text-sm font-medium">{session.patientName}</p>
              </div>
              <div className="space-y-1 rounded-lg border p-4">
                <p className="text-muted-foreground text-sm">Documentation state</p>
                <p className="text-sm font-medium">{session.noteState}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Working recap</CardTitle>
              <CardDescription>
                Static now, but already shaped like a future session detail contract.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {session.recap.map((item) => (
                <div key={item} className="rounded-lg border p-4 text-sm">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preparation checklist</CardTitle>
              <CardDescription>
                Small, explicit interactive seams can be added later without changing the detail
                boundary.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {session.checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 rounded-lg border p-4"
                >
                  <p className="text-sm">{item.label}</p>
                  <Badge variant={item.done ? "default" : "outline"}>
                    {item.done ? "Done" : "Pending"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next actions</CardTitle>
              <CardDescription>
                These remain local to the sessions route tree instead of leaking into workspace-wide
                abstractions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {session.nextActions.map((step) => (
                  <li key={step} className="text-sm">
                    <span className="bg-primary mr-3 inline-flex size-2 rounded-full" />
                    {step}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShellPage>
  )
}
