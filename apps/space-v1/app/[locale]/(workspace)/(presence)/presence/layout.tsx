import type { ReactNode } from "react"

import { PresenceSectionNav } from "@/app/[locale]/(workspace)/(presence)/presence/_components/presence-section-nav"
import { AppShellPage } from "@/app/[locale]/(workspace)/_components/app-shell-page"

export default function PresenceLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <AppShellPage>
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
          Presence workspace
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Presence</h1>
        <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
          This domain owns the future public profile, website, and publishing surfaces for the
          professional workspace.
        </p>
      </div>
      <PresenceSectionNav />
      <div className="flex flex-1 flex-col">{children}</div>
    </AppShellPage>
  )
}
