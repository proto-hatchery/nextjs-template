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
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"

import type { NoteRecord } from "@/app/[locale]/(workspace)/(operations)/notes/_lib/note-types"
import { AppShellPage } from "@/app/[locale]/(workspace)/_components/app-shell-page"

type NoteEditorShellProps = {
  mode: "create" | "detail"
  note?: NoteRecord
}

export function NoteEditorShell({ mode, note }: NoteEditorShellProps) {
  const title = mode === "create" ? "New note" : note?.title ?? "Note"
  const patientLabel = note?.patientName ?? "Select a patient"

  return (
    <AppShellPage className="max-w-5xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
            Notes workspace
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
            {mode === "create"
              ? "A focused creation surface that stays route-local to notes and can later absorb autosave and validation without touching the shell."
              : "A detail-first editing surface that keeps note context, metadata, and future history concerns inside the notes route tree."}
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/notes">Back to notes</Link>
          </Button>
          <Button variant="default">{mode === "create" ? "Save draft" : "Update note"}</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>{mode === "create" ? "Draft editor" : "Note editor"}</CardTitle>
            <CardDescription>
              This is intentionally static for now, but the shape is ready for future form state and
              persistence hooks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Title</p>
              <Input defaultValue={note?.title ?? "Untitled note"} aria-label="Note title" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Patient</p>
                <Input defaultValue={patientLabel} aria-label="Patient" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Session</p>
                <Input defaultValue={note?.sessionLabel ?? "Select session context"} aria-label="Session" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Summary</p>
              <Textarea
                defaultValue={note?.sections.summary ?? "Write the working summary for this note."}
                className="min-h-28"
                aria-label="Note summary"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Observations</p>
              <Textarea
                defaultValue={note?.sections.observations.join("\n- ") ?? "- Capture observations here"}
                className="min-h-32"
                aria-label="Observations"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Plan</p>
              <Textarea
                defaultValue={note?.sections.plan.join("\n- ") ?? "- Define the next actions here"}
                className="min-h-24"
                aria-label="Plan"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document status</CardTitle>
              <CardDescription>
                Local note metadata and publishing state should remain in the notes route tree.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant={note?.status === "Needs review" ? "secondary" : "outline"}>
                  {note?.status ?? "Draft"}
                </Badge>
                <Badge variant="ghost">{note?.type ?? "Clinical"}</Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                {note?.updatedAt ?? "Started just now"} • {mode === "create" ? "Unsaved draft" : "Route-local detail editor"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publishing checklist</CardTitle>
              <CardDescription>
                Future validation and sign-off can attach here without redesigning create/detail routes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li>
                  <span className="bg-primary mr-3 inline-flex size-2 rounded-full" />
                  Confirm patient and session context
                </li>
                <li>
                  <span className="bg-primary mr-3 inline-flex size-2 rounded-full" />
                  Complete the summary and observations sections
                </li>
                <li>
                  <span className="bg-primary mr-3 inline-flex size-2 rounded-full" />
                  Route for review or signature when the workflow is added
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShellPage>
  )
}
