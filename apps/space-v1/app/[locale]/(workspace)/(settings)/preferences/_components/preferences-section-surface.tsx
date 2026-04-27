import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

type PreferencesSectionSurfaceProps = {
  title: string
  description: string
  asideTitle: string
  asideDescription: string
  main: ReactNode
  aside: ReactNode
}

export function PreferencesSectionSurface({
  title,
  description,
  asideTitle,
  asideDescription,
  main,
  aside,
}: PreferencesSectionSurfaceProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{main}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{asideTitle}</CardTitle>
          <CardDescription>{asideDescription}</CardDescription>
        </CardHeader>
        <CardContent>{aside}</CardContent>
      </Card>
    </div>
  )
}
