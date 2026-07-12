import { defaultNavEntries } from "@/app/[locale]/(workspace)/_components/sidebar/nav-entries"
import type { NavEntry } from "@/app/[locale]/(workspace)/_components/sidebar/types"

function flattenNavEntries(entries: NavEntry[]): NavEntry[] {
  return entries.flatMap((entry) => {
    if (entry.isSection && entry.children) {
      return entry.children
    }

    return [entry]
  })
}

const flatNavItems = flattenNavEntries(defaultNavEntries)

function isActiveAppShellPath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href || pathname === "/"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

function getAppShellSection(pathname: string) {
  const direct = flatNavItems.find(
    (item) => item.url && isActiveAppShellPath(pathname, item.url)
  )
  if (direct?.title) {
    return { title: direct.title }
  }

  for (const item of flatNavItems) {
    if (item.children?.some((sub) => sub.url && isActiveAppShellPath(pathname, sub.url))) {
      return { title: item.title ?? "Fluri Space" }
    }
  }

  return null
}

export { flatNavItems, getAppShellSection, isActiveAppShellPath }
