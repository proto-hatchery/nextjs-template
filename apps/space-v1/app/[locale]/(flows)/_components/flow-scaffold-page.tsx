import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

type FlowScaffoldPageProps = {
  stepLabel: string
  title: string
  description: string
  milestones: readonly string[]
  children?: ReactNode
}

export function FlowScaffoldPage({
  stepLabel,
  title,
  description,
  milestones,
  children,
}: FlowScaffoldPageProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col justify-center px-4 py-10 sm:px-6">
      <Card>
        <CardHeader className="space-y-3">
          <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">{stepLabel}</p>
          <CardTitle className="text-3xl tracking-tight">{title}</CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-3">
            {milestones.map((milestone, index) => (
              <li key={milestone} className="flex items-start gap-3 rounded-lg border p-4">
                <span className="bg-muted text-foreground inline-flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                  {index + 1}
                </span>
                <p className="text-sm">{milestone}</p>
              </li>
            ))}
          </ol>
          {children}
        </CardContent>
      </Card>
    </main>
  )
}
