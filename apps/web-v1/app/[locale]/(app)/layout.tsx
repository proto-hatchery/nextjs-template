import type { ReactNode } from "react"

import { requireRoles } from "@workspace/supabase-auth/session/require-roles"

export default async function WebProtectedLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  await requireRoles({ anyOf: ["patient", "admin"] })

  return <main className="bg-background flex min-h-dvh flex-col">{children}</main>
}
