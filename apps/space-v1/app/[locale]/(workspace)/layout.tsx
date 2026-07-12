import type { ReactNode } from "react"

import { AppShell } from "@/app/[locale]/(workspace)/_components/app-shell"

export default async function WorkspaceLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <AppShell
      user={{
        name: "Dev Psychologist",
        email: "dev.psychologist@fluri.local",
      }}
    >
      {children}
    </AppShell>
  )
}
