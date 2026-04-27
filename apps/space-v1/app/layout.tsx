import type { ReactNode } from "react"

import { AppProviders } from "./_providers/app-providers.example"

export default function RootLayout({ children }: { children: ReactNode }) {
  return <AppProviders>{children}</AppProviders>
}
