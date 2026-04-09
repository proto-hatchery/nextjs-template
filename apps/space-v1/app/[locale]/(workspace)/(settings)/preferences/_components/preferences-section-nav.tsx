"use client"

import { Link, usePathname } from "@/i18n/navigation"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

const preferencesSectionItems = [
  { href: "/preferences/general", label: "General" },
  { href: "/preferences/availability", label: "Availability" },
  { href: "/preferences/notifications", label: "Notifications" },
  { href: "/preferences/security", label: "Security" },
] as const

export function PreferencesSectionNav() {
  const pathname = usePathname()

  return (
    <div className="flex flex-wrap gap-2">
      {preferencesSectionItems.map((item) => {
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
