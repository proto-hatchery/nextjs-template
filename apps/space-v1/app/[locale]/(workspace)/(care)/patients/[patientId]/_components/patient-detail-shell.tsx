import { PatientStatusBadge } from "@/app/[locale]/(workspace)/(care)/patients/_components/patient-status-badge"
import type { PatientProfile } from "@/app/[locale]/(workspace)/(care)/patients/_lib/patient-types"
import { AppShellPage } from "@/app/[locale]/(workspace)/_components/app-shell-page"
import { Link } from "@/i18n/navigation"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

type PatientDetailShellProps = {
  patient: PatientProfile
}

export function PatientDetailShell({ patient }: PatientDetailShellProps) {
  return (
    <AppShellPage>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarFallback>{patient.initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
                Patient workspace
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">{patient.name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PatientStatusBadge status={patient.status} />
            <Badge variant="outline">{patient.cadence}</Badge>
            {patient.tags.map((tag) => (
              <Badge key={tag} variant="ghost">
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
            {patient.primaryGoal}
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/patients">Back to directory</Link>
          </Button>
          <Button asChild>
            <Link href="/sessions">Schedule session</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {patient.metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="space-y-1">
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-2xl">{metric.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Care context</CardTitle>
              <CardDescription>
                This detail route owns the patient-facing summary surface. Later data integration
                can swap in without changing the route boundary.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1 rounded-lg border p-4">
                <p className="text-muted-foreground text-sm">Focus area</p>
                <p className="text-sm font-medium">{patient.focusArea}</p>
              </div>
              <div className="space-y-1 rounded-lg border p-4">
                <p className="text-muted-foreground text-sm">Next session</p>
                <p className="text-sm font-medium">{patient.nextSession}</p>
              </div>
              <div className="space-y-1 rounded-lg border p-4">
                <p className="text-muted-foreground text-sm">Last completed session</p>
                <p className="text-sm font-medium">{patient.lastSession}</p>
              </div>
              <div className="space-y-1 rounded-lg border p-4">
                <p className="text-muted-foreground text-sm">Contact preference</p>
                <p className="text-sm font-medium">{patient.contactPreference}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Care timeline</CardTitle>
              <CardDescription>
                A realistic route-local detail pattern: summary first, then timeline and next-step
                actions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.timeline.map((entry) => (
                <div key={entry.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium">{entry.title}</p>
                    <p className="text-muted-foreground text-xs">{entry.when}</p>
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm">{entry.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Administrative markers</CardTitle>
              <CardDescription>
                Real shared patient fields are adapted here without pushing backend DTOs into the
                shell or unrelated route trees.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {patient.administrativeMarkers.map((marker) => (
                <div key={marker.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium">{marker.label}</p>
                    <Badge variant="outline">{marker.value}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration note</CardTitle>
              <CardDescription>
                This route now reads real shared patient data. Related notes and documents can be
                integrated later using the same route-local adapter pattern.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm leading-relaxed">
              The UI architecture is unchanged, but the backing source is now the generated patients
              actions in `packages/supabase-data`, adapted locally inside this route tree.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coordinator note</CardTitle>
              <CardDescription>
                Local supporting context that should remain inside the patient domain tree.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm leading-relaxed">
              {patient.coordinatorNote}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next steps</CardTitle>
              <CardDescription>
                Future actions, notes, and documents can hang off this workspace without changing
                app-global structure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {patient.nextSteps.map((step) => (
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
