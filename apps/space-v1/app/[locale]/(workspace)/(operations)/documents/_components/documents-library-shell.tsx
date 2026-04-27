import { DocumentsLibraryFilters } from "@/app/[locale]/(workspace)/(operations)/documents/_components/documents-library-filters"
import type {
  DocumentRecord,
  DocumentsFilterState,
} from "@/app/[locale]/(workspace)/(operations)/documents/_lib/document-types"
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

type DocumentsLibraryShellProps = {
  documentsView: {
    filters: DocumentsFilterState
    filteredDocuments: DocumentRecord[]
    totalDocuments: number
  }
}

export function DocumentsLibraryShell({ documentsView }: DocumentsLibraryShellProps) {
  return (
    <AppShellPage>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
            Operations library
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
          <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
            Documents keep the library and detail surfaces in the persistent workspace, while the
            focused editing journey can live in its own protected flow.
          </p>
        </div>
        <Button>Create document</Button>
      </div>

      <DocumentsLibraryFilters filters={documentsView.filters} />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Library</CardTitle>
            <CardDescription>
              {documentsView.filteredDocuments.length} of {documentsView.totalDocuments} documents
              match the current view.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {documentsView.filteredDocuments.map((document) => (
              <Link
                key={document.id}
                href={`/documents/${document.id}`}
                className="hover:bg-muted/40 block rounded-lg border p-4 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium">{document.title}</p>
                    <div className="flex gap-2">
                      <Badge variant="ghost">{document.kind}</Badge>
                      <Badge variant={document.status === "Needs review" ? "secondary" : "outline"}>
                        {document.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {document.patientName} • {document.updatedAt}
                  </p>
                  <p className="text-muted-foreground text-sm">{document.summary}</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workspace model</CardTitle>
              <CardDescription>
                The documents slice now follows the same list/detail/edit pattern used by the
                stronger care domains.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2 text-sm">
              <p>Keep document records and filters in `documents/_lib`.</p>
              <p>
                Use `/documents/[documentId]` for detail and `/documents/[documentId]/edit` for the
                focused editing flow.
              </p>
              <p>Keep preview and publishing concerns inside the documents tree.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current queues</CardTitle>
              <CardDescription>
                Operational pressure should stay visible without forcing document workflows into
                app-global state.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li>
                  <span className="bg-primary mr-3 inline-flex size-2 rounded-full" />
                  Review Ana&apos;s care plan draft before it is published
                </li>
                <li>
                  <span className="bg-primary mr-3 inline-flex size-2 rounded-full" />
                  Reconcile Joao&apos;s invoice after the final session note closes
                </li>
                <li>
                  <span className="bg-primary mr-3 inline-flex size-2 rounded-full" />
                  Keep consent templates aligned with the intake flow
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShellPage>
  )
}
