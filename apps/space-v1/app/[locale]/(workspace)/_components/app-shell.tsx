"use client"

import type { ReactNode } from "react"

import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"

import { AppShellHeader } from "./app-shell-header"
import { AppShellMobileNav } from "./app-shell-mobile-nav"
import { SpaceSidebar } from "./space-sidebar"

type AppShellProps = {
  children: ReactNode
  user: {
    name: string
    email: string
  }
}

/** Fluri space shell: sidebar + inset content (profile/sign-out live in header menu). */
export function AppShell({ children, user: _user }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen className="flex h-dvh w-full flex-col overflow-hidden">
      <AppShellHeader />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <SpaceSidebar />
        <SidebarInset className="bg-background min-h-0 flex-1">
          <div className="safe-scroll flex min-h-0 flex-1 flex-col overflow-y-auto pb-[calc(4rem+var(--safe-area-inset-bottom))] md:pb-0">
            {children}
          </div>
          <AppShellMobileNav />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
