import type { DocumentRecord } from "@/app/[locale]/(workspace)/(operations)/documents/_lib/document-types"
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
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"

type DocumentEditorShellProps = {
  mode: "detail" | "edit"
  document: DocumentRecord
}

export function DocumentEditorShell({ mode, document }: DocumentEditorShellProps) {
  const heading = mode === "edit" ? "Document editor" : "Document detail"
  const content = (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
            Documents workspace
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{document.title}</h1>
          <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
            {mode === "edit"
              ? "A focused editing surface for templates and patient-specific documents, kept inside a protected task flow rather than the persistent workspace chrome."
              : "A route-local document detail surface with metadata, summary, and preview-ready content blocks."}
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/documents">Back to library</Link>
          </Button>
          {mode === "detail" ? (
            <Button asChild>
              <Link href={`/documents/${document.id}/edit`}>Open focused editor</Link>
            </Button>
          ) : (
            <Button>Save changes</Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>{heading}</CardTitle>
            <CardDescription>
              This surface already models future editor and preview behavior without introducing
              backend concerns.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Title</p>
                <Input defaultValue={document.title} aria-label="Document title" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Patient</p>
                <Input defaultValue={document.patientName} aria-label="Patient name" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Summary</p>
              <Textarea defaultValue={document.summary} className="min-h-24" aria-label="Summary" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Content blocks</p>
              <Textarea
                defaultValue={document.blocks.join("\n\n")}
                className="min-h-40"
                aria-label="Document content"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
              <CardDescription>
                Local document metadata stays in this tree and can later align with real delivery
                and signature state.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="ghost">{document.kind}</Badge>
                <Badge variant={document.status === "Needs review" ? "secondary" : "outline"}>
                  {document.status}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">{document.updatedAt}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publishing checklist</CardTitle>
              <CardDescription>
                Future export, sharing, and signature rules can attach here without altering the
                route structure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li>
                  <span className="bg-primary mr-3 inline-flex size-2 rounded-full" />
                  Review summary and wording
                </li>
                <li>
                  <span className="bg-primary mr-3 inline-flex size-2 rounded-full" />
                  Confirm patient-specific fields
                </li>
                <li>
                  <span className="bg-primary mr-3 inline-flex size-2 rounded-full" />
                  Publish or share from the route-local action set
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )

  if (mode === "edit") {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {content}
      </div>
    )
  }

  return <AppShellPage className="max-w-5xl">{content}</AppShellPage>
}
