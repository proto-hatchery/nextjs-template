"use client"

import { LogOut } from "lucide-react"
import { useTranslations } from "next-intl"

import { LocaleSwitcher } from "@/components/locale-switcher"
import { Link, usePathname } from "@/i18n/navigation"
import { buildAuthLogoutUrl } from "@workspace/supabase-auth/shared/auth-redirect"
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

import {
  careAppShellNavItems,
  isActiveAppShellPath,
  operationsAppShellNavItems,
  workspaceAppShellNavItems,
} from "./app-shell-nav"

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
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
            {t("brand")}
          </Link>
          <div className="shrink-0">
            <LocaleSwitcher />
          </div>
        </div>
        <p className="text-sidebar-foreground/70 text-xs leading-relaxed">{t("sidebarIntro")}</p>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("careLabel")}</SidebarGroupLabel>
          <SidebarMenu>
            {careAppShellNavItems.map((item) => {
              const Icon = item.icon

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActiveAppShellPath(pathname, item.href)}>
                    <Link href={item.href}>
                      <Icon strokeWidth={2} />
                      <span>{t(`nav.${item.labelKey}`)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>{t("operationsLabel")}</SidebarGroupLabel>
          <SidebarMenu>
            {operationsAppShellNavItems.map((item) => {
              const Icon = item.icon

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActiveAppShellPath(pathname, item.href)}>
                    <Link href={item.href}>
                      <Icon strokeWidth={2} />
                      <span>{t(`nav.${item.labelKey}`)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>{t("workspaceLabel")}</SidebarGroupLabel>
          <SidebarMenu>
            {workspaceAppShellNavItems.map((item) => {
              const Icon = item.icon

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActiveAppShellPath(pathname, item.href)}>
                    <Link href={item.href}>
                      <Icon strokeWidth={2} />
                      <span>{t(`nav.${item.labelKey}`)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href={buildAuthLogoutUrl()}>
                  <LogOut strokeWidth={2} />
                  <span>{t("signOut")}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border border-t p-3">
        <div className="bg-sidebar-accent/40 border-sidebar-border rounded-lg border px-3 py-3">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="text-sidebar-foreground/70 truncate text-xs">{user.email}</p>
          <div className="mt-3 flex gap-2">
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link href="/preferences">{t("manageWorkspace")}</Link>
            </Button>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
