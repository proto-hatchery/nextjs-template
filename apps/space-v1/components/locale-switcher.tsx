"use client"

import { useLocale } from "next-intl"

import { usePathname, useRouter } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  return (
    <select
      value={locale}
      onChange={(e) => {
        router.replace(pathname, { locale: e.target.value })
      }}
      aria-label="Select language"
    >
      {routing.locales.map((l) => (
        <option key={l} value={l}>
          {l.toUpperCase()}
        </option>
      ))}
    </select>
  )
}
