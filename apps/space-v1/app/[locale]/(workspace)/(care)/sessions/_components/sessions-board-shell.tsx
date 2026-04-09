import { Link } from "@/i18n/navigation"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import type { SessionsBoardView } from "@/app/[locale]/(workspace)/(care)/sessions/_lib/session-types"
import { SessionStatusBadge } from "@/app/[locale]/(workspace)/(care)/sessions/_components/session-status-badge"
import { AppShellPage } from "@/app/[locale]/(workspace)/_components/app-shell-page"

type SessionsBoardShellProps = {
  boardView: SessionsBoardView
}

export function SessionsBoardShell({ boardView }: SessionsBoardShellProps) {
  return (
    <AppShellPage>
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">Care delivery</p>
        <h1 className="text-2xl font-semibold tracking-tight">Sessions</h1>
        <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
          This route now models a route-local workbench slice: grouped status lanes, static records,
          and a detail boundary that can absorb future session tools without shell churn.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-4 lg:grid-cols-3">
          {boardView.groupedSessions.map((column) => (
            <Card key={column.status}>
              <CardHeader>
                <CardTitle>{column.status}</CardTitle>
                <CardDescription>
                  Route-local grouping that can later be driven by real session state.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {column.items.map((session) => (
                  <Link
                    key={session.id}
                    href={`/sessions/${session.id}`}
                    className="hover:bg-muted/40 block rounded-lg border p-3 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">{session.title}</p>
                        <SessionStatusBadge status={session.status} />
                      </div>
                      <p className="text-muted-foreground text-sm">{session.patientName}</p>
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-muted-foreground">{session.startsAt}</span>
                        <span className="text-muted-foreground">{session.noteState}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Operational notes</CardTitle>
            <CardDescription>
              A compact reference pattern for future session-area migration work.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {boardView.operationalNotes.map((item) => (
              <div key={item} className="rounded-lg border p-4 text-sm">
                {item}
              </div>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link href="/patients">Cross-check patient context</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShellPage>
  )
}
