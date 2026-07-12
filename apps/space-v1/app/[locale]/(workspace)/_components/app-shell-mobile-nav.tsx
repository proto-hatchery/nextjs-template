"use client"

import { usePathname } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"
import { cn } from "@workspace/ui/lib/utils"

import { defaultNavEntries } from "@/app/[locale]/(workspace)/_components/sidebar/nav-entries"

const mobileHrefs = ["/dashboard", "/calendar", "/patients", "/sessions"] as const

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href || pathname === "/"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppShellMobileNav() {
  const pathname = usePathname()

  const items = defaultNavEntries
    .flatMap((section) => section.children ?? [])
    .filter((item) => item.url && mobileHrefs.includes(item.url as (typeof mobileHrefs)[number]))

  return (
    <nav className="border-border/80 bg-background/95 pb-safe fixed right-0 bottom-0 left-0 z-30 border-t backdrop-blur md:hidden">
      <div className="grid h-16 grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon
          if (!Icon || !item.url) {
            return null
          }

          const isActive = isActivePath(pathname, item.url)

          return (
            <Link
              key={item.url}
              href={item.url}
              className={cn(
                "text-muted-foreground flex flex-col items-center justify-center gap-1 px-2 text-[0.625rem] font-medium transition-colors",
                isActive && "text-foreground"
              )}
            >
              <Icon className="size-4" strokeWidth={2} />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
