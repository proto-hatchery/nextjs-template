"use client"

import { useTranslations } from "next-intl"

import { Link, usePathname } from "@/i18n/navigation"
import { cn } from "@workspace/ui/lib/utils"

import { careAppShellNavItems, isActiveAppShellPath } from "./app-shell-nav"

export function AppShellMobileNav() {
  const pathname = usePathname()
  const t = useTranslations("AppShell")

  return (
    <nav className="border-border/80 bg-background/95 pb-safe fixed right-0 bottom-0 left-0 z-30 border-t backdrop-blur md:hidden">
      <div className="grid h-16 grid-cols-4">
        {careAppShellNavItems.map((item) => {
          const Icon = item.icon
          const isActive = isActiveAppShellPath(pathname, item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-muted-foreground flex flex-col items-center justify-center gap-1 px-2 text-[0.625rem] font-medium transition-colors",
                isActive && "text-foreground"
              )}
            >
              <Icon className="size-4" strokeWidth={2} />
              <span>{t(`nav.${item.labelKey}`)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
