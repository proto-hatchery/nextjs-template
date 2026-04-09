import { authPageMainClass } from "@/app/[locale]/(auth)/_lib/auth-page-classes"
import { Link } from "@/i18n/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

export default function SignUpDisabledPage() {
  return (
    <main className={authPageMainClass}>
      <Card className="border-border w-full max-w-md rounded-2xl border shadow-none">
        <CardHeader>
          <CardTitle>Registo desativado</CardTitle>
          <CardDescription>
            As contas são criadas por administradores. Se precisa de acesso, contacte a equipa
            responsável.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <Link className="font-medium text-[#4F6EF7] underline underline-offset-4" href="/sign-in">
            Voltar ao início de sessão
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}
