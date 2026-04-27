import { getTranslations } from "next-intl/server"

import { LocaleSwitcher } from "@/components/locale-switcher"
import { Link } from "@/i18n/navigation"
import { Button } from "@workspace/ui/components/button"

export async function SiteHeader() {
  const t = await getTranslations("Nav")

  return (
    <header className="border-border/80 bg-background/95 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          {t("brand")}
        </Link>
        <nav className="flex items-center gap-2">
          <LocaleSwitcher />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sign-in">{t("login")}</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
