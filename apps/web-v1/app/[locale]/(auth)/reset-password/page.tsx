import { AuthSplitShell } from "@/app/[locale]/(auth)/_components/auth-split-shell"
import { ResetPasswordForm } from "@/app/[locale]/(auth)/_components/reset-password-form"
import { authPageMainClass } from "@/app/[locale]/(auth)/_lib/auth-page-classes"
import { requireUser } from "@workspace/supabase-auth/session/require-user"
import {
  resolveAuthSearchParams,
  type AuthSearchParams,
} from "@workspace/supabase-auth/shared/resolve-auth-search-params"

type ResetPasswordPageProps = {
  searchParams: AuthSearchParams
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  await requireUser()
  const { redirectTo } = await resolveAuthSearchParams(searchParams)

  return (
    <main className={authPageMainClass}>
      <AuthSplitShell>
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              Definir nova palavra-passe
            </h1>
            <p className="text-muted-foreground text-sm">
              A sessão de recuperação é validada no servidor antes de esta página ser mostrada.
            </p>
          </div>
          <ResetPasswordForm redirectTo={redirectTo} />
        </div>
      </AuthSplitShell>
    </main>
  )
}
