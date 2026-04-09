import {
  CalendarDays,
  CreditCard,
  FileText,
  Globe,
  LayoutDashboard,
  NotebookPen,
  Settings2,
  Stethoscope,
  Users,
} from "lucide-react"

type AppShellNavItem = {
  href: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  labelKey:
    | "dashboard"
    | "calendar"
    | "sessions"
    | "patients"
    | "billing"
    | "documents"
    | "notes"
    | "presence"
    | "preferences"
}

const careAppShellNavItems: AppShellNavItem[] = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    labelKey: "dashboard",
  },
  {
    href: "/calendar",
    icon: CalendarDays,
    labelKey: "calendar",
  },
  {
    href: "/sessions",
    icon: Stethoscope,
    labelKey: "sessions",
  },
  {
    href: "/patients",
    icon: Users,
    labelKey: "patients",
  },
]

const operationsAppShellNavItems: AppShellNavItem[] = [
  {
    href: "/billing",
    icon: CreditCard,
    labelKey: "billing",
  },
  {
    href: "/documents",
    icon: FileText,
    labelKey: "documents",
  },
  {
    href: "/notes",
    icon: NotebookPen,
    labelKey: "notes",
  },
]

const workspaceAppShellNavItems: AppShellNavItem[] = [
  {
    href: "/presence",
    icon: Globe,
    labelKey: "presence",
  },
  {
    href: "/preferences",
    icon: Settings2,
    labelKey: "preferences",
  },
]

function isActiveAppShellPath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

function getAppShellSection(pathname: string) {
  return [
    ...careAppShellNavItems,
    ...operationsAppShellNavItems,
    ...workspaceAppShellNavItems,
  ].find((item) => isActiveAppShellPath(pathname, item.href))
}

export {
  careAppShellNavItems,
  getAppShellSection,
  isActiveAppShellPath,
  operationsAppShellNavItems,
  workspaceAppShellNavItems,
  type AppShellNavItem,
}
