import type { JwtPayload } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

import { AuthSplitShell } from "@/app/[locale]/(auth)/_components/auth-split-shell"
import { AuthenticatedSessionCard } from "@/app/[locale]/(auth)/_components/authenticated-session-card"
import { SignInForm } from "@/app/[locale]/(auth)/_components/sign-in-form"
import { authPageMainClass } from "@/app/[locale]/(auth)/_lib/auth-page-classes"
import { getAccess } from "@workspace/supabase-auth/session/get-access"
import { getClaims } from "@workspace/supabase-auth/session/get-claims"
import { getUser } from "@workspace/supabase-auth/session/get-user"
import {
  buildAuthContinueUrl,
  getContinueDecision,
} from "@workspace/supabase-auth/shared/app-destination"
import { getDefaultRedirectTo } from "@workspace/supabase-auth/shared/auth-redirect"
import {
  resolveAuthSearchParams,
  type AuthSearchParams,
} from "@workspace/supabase-auth/shared/resolve-auth-search-params"

type LoginPageProps = {
  searchParams: AuthSearchParams
}

const AUTH_MESSAGES: Record<string, string> = {
  callback_error: "O Supabase não conseguiu concluir a troca de código OAuth para esta sessão.",
  callback_missing_code: "O pedido de retorno não inclui o código de autenticação do Supabase.",
  confirm_error: "Não foi possível confirmar este e-mail ou a ligação de recuperação.",
  confirm_missing_token: "A ligação de confirmação de e-mail não contém o token necessário.",
  signed_out: "A sessão foi terminada com sucesso.",
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [claims, user] = await Promise.all([getClaims(), getUser()])
  const { auth, redirectTo } = await resolveAuthSearchParams(searchParams)
  const notice = auth ? AUTH_MESSAGES[auth] : null
  const access = claims?.sub ? await getAccess(claims as JwtPayload | null) : null

  if (claims?.sub && access) {
    const decision = getContinueDecision({
      redirectTo: redirectTo ?? getDefaultRedirectTo(),
      roles: access.roles,
    })

    if (decision.kind === "redirect") {
      redirect(decision.href)
    }

    if (decision.kind === "chooser") {
      redirect(buildAuthContinueUrl(redirectTo ?? getDefaultRedirectTo()))
    }

    if (decision.kind === "access-denied") {
      redirect(decision.href)
    }
  }

  return (
    <main className={authPageMainClass}>
      <AuthSplitShell>
        {notice ? (
          <div className="mb-6 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs/relaxed text-emerald-700 dark:text-emerald-300">
            {notice}
          </div>
        ) : null}
        {claims?.sub && access ? (
          <AuthenticatedSessionCard
            claims={claims}
            redirectTo={redirectTo ?? getDefaultRedirectTo()}
            roles={access.roles}
            userEmail={user?.email ?? claims.email ?? claims.sub}
          />
        ) : (
          <SignInForm redirectTo={redirectTo} />
        )}
      </AuthSplitShell>
    </main>
  )
}
