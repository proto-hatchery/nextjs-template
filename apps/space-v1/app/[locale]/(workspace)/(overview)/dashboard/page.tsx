import { CalendarDays, FileText, Receipt, UserCircle } from "lucide-react"

import { Link } from "@/i18n/navigation"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

const quickLinks = [
  {
    href: "/patients",
    title: "Pacientes",
    description: "Acompanhe pacientes, prontuarios e dados clinicos.",
    icon: UserCircle,
  },
  {
    href: "/sessions",
    title: "Sessoes",
    description: "Veja agenda clinica, status e proximos atendimentos.",
    icon: CalendarDays,
  },
  {
    href: "/billing",
    title: "Cobrancas",
    description: "Abra o fluxo operacional de pagamentos e faturas.",
    icon: Receipt,
  },
  {
    href: "/documents",
    title: "Documentos",
    description: "Acesse modelos, documentos gerados e revisoes.",
    icon: FileText,
  },
] as const

export default function DashboardPage() {
  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex max-w-6xl flex-col gap-6">
        <div className="space-y-2">
          <Badge variant="secondary" className="w-fit">
            Fluri Space
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Area interna para psicologos
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Esta tela esta temporariamente reduzida para desbloquear o ambiente local enquanto a
            migracao completa dos modulos do Fluri e finalizada.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((item) => {
            const Icon = item.icon

            return (
              <Card key={item.href}>
                <CardHeader className="space-y-3">
                  <div className="flex size-10 items-center justify-center rounded-md border bg-muted">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription className="mt-1 text-sm leading-5">
                      {item.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" size="sm">
                    <Link href={item.href}>Abrir</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </main>
  )
}
