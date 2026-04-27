import type { JwtPayload } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

import { authPageMainClass } from "@/app/[locale]/(auth)/_lib/auth-page-classes"
import { Link } from "@/i18n/navigation"
import { getAccess } from "@workspace/supabase-auth/session/get-access"
import { getClaims } from "@workspace/supabase-auth/session/get-claims"
import {
  getContinueDecision,
  type AppDestination,
} from "@workspace/supabase-auth/shared/app-destination"
import { buildAuthSignInUrl } from "@workspace/supabase-auth/shared/auth-redirect"
import {
  resolveAuthSearchParams,
  type AuthSearchParams,
} from "@workspace/supabase-auth/shared/resolve-auth-search-params"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

type ContinuePageProps = {
  searchParams: AuthSearchParams
}

function DestinationLinks({ destinations }: { destinations: AppDestination[] }) {
  return (
    <div className="grid gap-3">
      {destinations.map((destination) => (
        <Link
          key={destination.href}
          className="border-border bg-background hover:bg-muted/50 rounded-xl border px-4 py-3 text-sm transition-colors"
          href={destination.href}
        >
          <div className="font-medium">{destination.label}</div>
          <div className="text-muted-foreground text-xs">{destination.href}</div>
        </Link>
      ))}
    </div>
  )
}

export default async function ContinuePage({ searchParams }: ContinuePageProps) {
  const { redirectTo } = await resolveAuthSearchParams(searchParams)
  const claims = await getClaims()

  if (!claims?.sub) {
    redirect(buildAuthSignInUrl(redirectTo))
  }

  const access = await getAccess(claims as JwtPayload | null)

  const decision = getContinueDecision({
    redirectTo,
    roles: access.roles,
  })

  if (decision.kind === "redirect" || decision.kind === "access-denied") {
    redirect(decision.href)
  }

  return (
    <main className={authPageMainClass}>
      <Card className="border-border w-full max-w-xl rounded-2xl border shadow-none">
        <CardHeader>
          <CardTitle>Escolha o espaço de trabalho</CardTitle>
          <CardDescription>
            A sessão tem acesso a vários espaços. Escolha para onde quer continuar.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <DestinationLinks destinations={decision.destinations} />
        </CardContent>
      </Card>
    </main>
  )
}
