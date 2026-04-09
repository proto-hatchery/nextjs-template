import { AuthSplitShell } from "@/app/[locale]/(auth)/_components/auth-split-shell"
import { MagicLinkForm } from "@/app/[locale]/(auth)/_components/magic-link-form"
import { authPageMainClass } from "@/app/[locale]/(auth)/_lib/auth-page-classes"
import { Link } from "@/i18n/navigation"
import {
  resolveAuthSearchParams,
  type AuthSearchParams,
} from "@workspace/supabase-auth/shared/resolve-auth-search-params"

type MagicLinkPageProps = {
  searchParams: AuthSearchParams
}

export default async function MagicLinkPage({ searchParams }: MagicLinkPageProps) {
  const { redirectTo } = await resolveAuthSearchParams(searchParams)

  return (
    <main className={authPageMainClass}>
      <AuthSplitShell>
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              Ligação mágica por e-mail
            </h1>
            <p className="text-muted-foreground text-sm">
              Este fluxo sem palavra-passe não cria contas: apenas inicia sessão para utilizadores
              existentes.
            </p>
          </div>
          <MagicLinkForm redirectTo={redirectTo} />
          <p className="text-muted-foreground text-center text-sm">
            Prefere usar palavra-passe?{" "}
            <Link
              className="font-medium text-[#4F6EF7] underline underline-offset-4"
              href={`/sign-in?redirect_to=${encodeURIComponent(redirectTo)}`}
            >
              Voltar ao início de sessão
            </Link>
          </p>
        </div>
      </AuthSplitShell>
    </main>
  )
}
