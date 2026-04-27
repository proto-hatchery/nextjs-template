"use client"

import { useTranslations } from "next-intl"

import { Link, usePathname } from "@/i18n/navigation"
import { buildAuthLogoutUrl } from "@workspace/supabase-auth/shared/auth-redirect"
import { Button } from "@workspace/ui/components/button"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"

import { getAppShellSection } from "./app-shell-nav"

export function AppShellHeader() {
  const pathname = usePathname()
  const t = useTranslations("AppShell")
  const section = getAppShellSection(pathname)

  return (
    <header className="border-border/80 bg-background/95 pt-safe sticky top-0 z-20 flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="shrink-0" />
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
            {t("shellLabel")}
          </p>
          <h1 className="truncate text-sm font-semibold sm:text-base">
            {section ? t(`nav.${section.labelKey}`) : t("brand")}
          </h1>
        </div>
      </div>

      <div className="hidden items-center gap-2 sm:flex">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/preferences">{t("nav.preferences")}</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href={buildAuthLogoutUrl()}>{t("signOut")}</a>
        </Button>
      </div>
    </header>
  )
}
