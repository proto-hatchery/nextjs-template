import type { ReactNode } from "react"

import { PreferencesSectionNav } from "@/app/[locale]/(workspace)/(settings)/preferences/_components/preferences-section-nav"
import { AppShellPage } from "@/app/[locale]/(workspace)/_components/app-shell-page"

export default function PreferencesLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <AppShellPage>
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
          Workspace settings
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Preferences</h1>
        <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
          This domain owns account and workspace preferences without leaking settings-specific
          structure into unrelated routes.
        </p>
      </div>
      <PreferencesSectionNav />
      <div className="flex flex-1 flex-col">{children}</div>
    </AppShellPage>
  )
}
