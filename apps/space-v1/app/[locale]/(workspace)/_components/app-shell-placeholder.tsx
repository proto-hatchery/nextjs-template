import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { AppShellPage } from "./app-shell-page"

type AppShellPlaceholderProps = {
  title: string
  description: string
  eyebrow?: string
  plannedSlices?: string[]
  children?: ReactNode
}

export function AppShellPlaceholder({
  title,
  description,
  eyebrow = "Next migration slice",
  plannedSlices,
  children,
}: AppShellPlaceholderProps) {
  return (
    <AppShellPage>
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">{eyebrow}</p>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">{description}</p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Structure scaffold ready</CardTitle>
          <CardDescription>
            Future migration phases can plug route-local UI into this section without reviving the
            legacy app-global layout sprawl.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-3 text-sm">
          <p>
            This placeholder exists to lock the route boundary, shell behavior, and future ownership
            for this section before domain logic starts moving in.
          </p>
          {plannedSlices && plannedSlices.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5">
              {plannedSlices.map((slice) => (
                <li key={slice}>{slice}</li>
              ))}
            </ul>
          ) : null}
          {children}
        </CardContent>
      </Card>
    </AppShellPage>
  )
}
