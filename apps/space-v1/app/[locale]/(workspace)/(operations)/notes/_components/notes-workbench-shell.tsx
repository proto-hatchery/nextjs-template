import { NotesWorkbenchFilters } from "@/app/[locale]/(workspace)/(operations)/notes/_components/notes-workbench-filters"
import type {
  NoteRecord,
  NotesFilterState,
  NoteStatus,
} from "@/app/[locale]/(workspace)/(operations)/notes/_lib/note-types"
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

type NotesWorkbenchShellProps = {
  notesView: {
    filters: NotesFilterState
    filteredNotes: NoteRecord[]
    totalNotes: number
  }
}

const noteStatusVariantMap: Record<NoteStatus, "outline" | "secondary" | "default"> = {
  Draft: "outline",
  "Needs review": "secondary",
  Signed: "default",
}

export function NotesWorkbenchShell({ notesView }: NotesWorkbenchShellProps) {
  return (
    <AppShellPage>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
            Operations workbench
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
          <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
            Notes are the secondary reference slice for creation and detail editing. The route tree
            stays local, while future autosave and validation logic can slot in later.
          </p>
        </div>
        <Button asChild>
          <Link href="/notes/new">Create note</Link>
        </Button>
      </div>

      <NotesWorkbenchFilters filters={notesView.filters} />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Notes library</CardTitle>
            <CardDescription>
              {notesView.filteredNotes.length} of {notesView.totalNotes} notes match the current
              view.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {notesView.filteredNotes.length === 0 ? (
              <div className="space-y-2 rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm font-medium">No notes match this view</p>
                <p className="text-muted-foreground text-sm">
                  Clear the search or widen the status filter to reopen the library.
                </p>
              </div>
            ) : (
              notesView.filteredNotes.map((note) => (
                <Link
                  key={note.id}
                  href={`/notes/${note.id}`}
                  className="hover:bg-muted/40 block rounded-lg border p-4 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{note.title}</p>
                        <Badge variant={noteStatusVariantMap[note.status]}>{note.status}</Badge>
                        <Badge variant="ghost">{note.type}</Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {note.patientName} • {note.sessionLabel}
                      </p>
                      <p className="text-muted-foreground text-sm">{note.excerpt}</p>
                    </div>
                    <p className="text-muted-foreground text-xs">{note.updatedAt}</p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Editing model</CardTitle>
              <CardDescription>
                Notes now show the expected create/detail route pattern for future vertical slices.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2 text-sm">
              <p>Keep note contracts and filtering logic in `notes/_lib`.</p>
              <p>Use `/notes/new` for focused drafting and `/notes/[noteId]` for detail editing.</p>
              <p>Keep validation, autosave, and history concerns local to the notes tree.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current pressure</CardTitle>
              <CardDescription>
                A small workflow summary keeps the slice feeling real without backend integration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li>
                  <span className="bg-primary mr-3 inline-flex size-2 rounded-full" />
                  Review Ana&apos;s intake draft before the care plan is published
                </li>
                <li>
                  <span className="bg-primary mr-3 inline-flex size-2 rounded-full" />
                  Promote Marta&apos;s assessment to signed once the clinician confirms the final
                  wording
                </li>
                <li>
                  <span className="bg-primary mr-3 inline-flex size-2 rounded-full" />
                  Keep Joao&apos;s progress note open until the reschedule is confirmed
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShellPage>
  )
}
