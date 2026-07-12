"use client"

import { LogOut } from "lucide-react"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"

import { LocaleSwitcher } from "@/components/locale-switcher"
import { Link, usePathname } from "@/i18n/navigation"
import { Button } from "@workspace/ui/components/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@workspace/ui/components/sidebar"

import { defaultNavEntries } from "./sidebar/nav-entries"
import { isActiveAppShellPath } from "./app-shell-nav"
import { SignOutLink } from "./sign-out-link"

type AppShellSidebarProps = {
  user: {
    name: string
    email: string
  }
}

export function AppShellSidebar({ user }: AppShellSidebarProps) {
  const pathname = usePathname()
  const t = useTranslations("AppShell")

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-sidebar-border gap-3 border-b px-3 py-4">
        <AppShellBrandRow t={t} />
      </SidebarHeader>

      <SidebarContent>
        {defaultNavEntries.map((section, sectionIndex) => (
          <FragmentWithSeparator key={section.title ?? sectionIndex} sectionIndex={sectionIndex}>
            <SidebarGroup>
              {section.title ? <SidebarGroupLabel>{section.title}</SidebarGroupLabel> : null}
              <SidebarMenu>
                {(section.children ?? []).map((item) => {
                  const Icon = item.icon
                  const ActiveIcon = item.activeIcon ?? item.icon
                  const href = item.url ?? item.children?.[0]?.url ?? "/dashboard"
                  const isActive = isActiveAppShellPath(pathname, href)

                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={href}>
                          {Icon ? (
                            isActive && ActiveIcon ? (
                              <ActiveIcon strokeWidth={2} />
                            ) : (
                              <Icon strokeWidth={2} />
                            )
                          ) : null}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroup>
          </FragmentWithSeparator>
        ))}

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <SignOutLink className="flex w-full items-center gap-2">
                  <LogOut strokeWidth={2} />
                  <span>{t("signOut")}</span>
                </SignOutLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border border-t p-3">
        <div className="bg-sidebar-accent/40 border-sidebar-border rounded-lg border px-3 py-3">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="text-sidebar-foreground/70 truncate text-xs">{user.email}</p>
          <UserFooterActions t={t} />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function AppShellBrandRow({ t }: { t: ReturnType<typeof useTranslations<"AppShell">> }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
        {t("brand")}
      </Link>
      <div className="shrink-0">
        <LocaleSwitcher />
      </div>
    </div>
  )
}

function FragmentWithSeparator({
  sectionIndex,
  children,
}: {
  sectionIndex: number
  children: ReactNode
}) {
  return (
    <>
      {sectionIndex > 0 ? <SidebarSeparator /> : null}
      {children}
    </>
  )
}

function UserFooterActions({
  t,
}: {
  t: ReturnType<typeof useTranslations<"AppShell">>
}) {
  return (
    <div className="mt-3 flex gap-2">
      <Button variant="outline" size="sm" asChild className="flex-1">
        <Link href="/preferences">{t("manageWorkspace")}</Link>
      </Button>
    </div>
  )
}
