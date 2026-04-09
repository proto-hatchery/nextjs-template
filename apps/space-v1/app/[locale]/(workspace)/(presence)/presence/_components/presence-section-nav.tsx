"use client"

import { Link, usePathname } from "@/i18n/navigation"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

const presenceSectionItems = [
  { href: "/presence/profile", label: "Profile" },
  { href: "/presence/links", label: "Links" },
  { href: "/presence/preferences", label: "Preferences" },
] as const

export function PresenceSectionNav() {
  const pathname = usePathname()

  return (
    <div className="flex flex-wrap gap-2">
      {presenceSectionItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Button
            key={item.href}
            asChild
            size="sm"
            variant={isActive ? "default" : "outline"}
            className={cn(!isActive && "bg-background")}
          >
            <Link href={item.href}>{item.label}</Link>
          </Button>
        )
      })}
    </div>
  )
}
