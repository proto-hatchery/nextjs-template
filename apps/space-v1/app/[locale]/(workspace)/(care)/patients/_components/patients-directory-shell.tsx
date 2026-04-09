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

import {
  type PatientDirectoryView,
} from "@/app/[locale]/(workspace)/(care)/patients/_lib/patient-types"
import { PatientsDirectoryFilters } from "@/app/[locale]/(workspace)/(care)/patients/_components/patients-directory-filters"
import { PatientStatusBadge } from "@/app/[locale]/(workspace)/(care)/patients/_components/patient-status-badge"
import { AppShellPage } from "@/app/[locale]/(workspace)/_components/app-shell-page"

type PatientsDirectoryShellProps = {
  directoryView: PatientDirectoryView
}

export function PatientsDirectoryShell({ directoryView }: PatientsDirectoryShellProps) {
  const featuredPatient = directoryView.filteredPatients[0]

  return (
    <AppShellPage>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">Care directory</p>
          <h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
          <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
            This route now acts as a canonical list slice: route-local data, route-local cards, and
            a detail boundary that future migrations can extend without touching the shell.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Invite patient</Button>
          <Button>Create patient</Button>
        </div>
      </div>

      <PatientsDirectoryFilters filters={directoryView.filters} />

      <div className="grid gap-4 md:grid-cols-3">
        {directoryView.stats.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="space-y-1">
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-3xl">{metric.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Directory</CardTitle>
            <CardDescription>
              {directoryView.filteredPatients.length} of {directoryView.totalPatients} patients
              match the current workspace filters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {directoryView.filteredPatients.length === 0 ? (
              <div className="space-y-2 rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm font-medium">No patients match this view</p>
                <p className="text-muted-foreground text-sm">
                  Clear the query or choose a broader status filter to reopen the directory.
                </p>
              </div>
            ) : (
              directoryView.filteredPatients.map((patient) => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.id}`}
                  className="hover:bg-muted/40 block rounded-lg border p-4 transition-colors"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>{patient.initials}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">{patient.name}</p>
                          <PatientStatusBadge status={patient.status} />
                        </div>
                        <p className="text-muted-foreground text-sm">{patient.focusArea}</p>
                        <div className="flex flex-wrap gap-2">
                          {patient.tags.map((tag) => (
                            <Badge key={tag} variant="ghost">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm lg:text-right">
                      <p className="font-medium">{patient.nextSession}</p>
                      <p className="text-muted-foreground">Last session: {patient.lastSession}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {featuredPatient ? (
            <Card>
              <CardHeader>
                <CardTitle>Highlighted profile</CardTitle>
                <CardDescription>
                  A local summary card that keeps selection logic inside the patients tree.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{featuredPatient.initials}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{featuredPatient.name}</p>
                    <p className="text-muted-foreground text-sm">{featuredPatient.primaryGoal}</p>
                  </div>
                </div>
                <div className="grid gap-3">
                  {featuredPatient.administrativeMarkers.slice(0, 2).map((marker) => (
                    <div key={marker.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">{marker.label}</p>
                        <Badge variant="outline">{marker.value}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/patients/${featuredPatient.id}`}>Open patient workspace</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Attention queue</CardTitle>
              <CardDescription>
                The patients route owns care coordination cues instead of pushing them into global
                workspace helpers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {directoryView.attentionQueue.map((item) => (
                  <li key={item} className="text-sm">
                    <span className="bg-primary mr-3 inline-flex size-2 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Migration pattern</CardTitle>
              <CardDescription>
                This domain now demonstrates the expected list and detail split for future slices.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2 text-sm">
              <p>Keep local records in `patients/_lib` and keep route-specific UI under the route tree.</p>
              <p>Extend `/patients/[patientId]` with notes, documents, and timeline sections locally.</p>
              <p>Do not move patient-specific concerns into the workspace shell.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShellPage>
  )
}
