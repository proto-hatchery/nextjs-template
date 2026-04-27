"use client"

import type { ReactNode } from "react"

import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"

import { AppShellHeader } from "./app-shell-header"
import { AppShellMobileNav } from "./app-shell-mobile-nav"
import { AppShellSidebar } from "./app-shell-sidebar"

type AppShellProps = {
  children: ReactNode
  user: {
    name: string
    email: string
  }
}

export function AppShell({ children, user }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen>
      <AppShellSidebar user={user} />
      <SidebarInset className="min-h-dvh">
        <AppShellHeader />
        <div className="safe-scroll flex min-h-0 flex-1 flex-col pb-[calc(4rem+var(--safe-area-inset-bottom))] md:pb-0">
          {children}
        </div>
        <AppShellMobileNav />
      </SidebarInset>
    </SidebarProvider>
  )
}
