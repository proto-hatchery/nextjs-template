import type { ReactNode } from "react"

import { AppShell } from "@/app/[locale]/(workspace)/_components/app-shell"
import type { JWTClaims } from "@workspace/supabase-auth/session/get-claims"
import { requireRoles } from "@workspace/supabase-auth/session/require-roles"

function getShellUser(claims: JWTClaims) {
  const userMetadata = ((claims as Record<string, unknown>).user_metadata ?? {}) as Record<
    string,
    unknown
  >

  const name =
    (claims as Record<string, unknown>).full_name ??
    userMetadata.full_name ??
    userMetadata.name ??
    claims.email?.split("@")[0] ??
    "Workspace"

  return {
    name: String(name),
    email: claims.email ?? "",
  }
}

export default async function WorkspaceLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const claims = await requireRoles({ anyOf: ["psychologist", "admin"] })

  return <AppShell user={getShellUser(claims)}>{children}</AppShell>
}
