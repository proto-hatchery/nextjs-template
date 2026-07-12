"use client"

import { AppSidebar } from "@/app/[locale]/(workspace)/_components/sidebar/app-sidebar"
import { defaultNavEntries } from "@/app/[locale]/(workspace)/_components/sidebar/nav-entries"

export function SpaceSidebar() {
  return (
    <AppSidebar
      navEntries={defaultNavEntries}
      visibilityContext={{ app: "space" }}
      className="[&>[data-slot=sidebar-inner]]:bg-transparent [&_[data-sidebar=menu-button][data-active=true]]:bg-secondary/50 [&_[data-sidebar=menu-button][data-active=true]]:text-secondary-foreground [&_[data-sidebar=menu-button]]:cursor-pointer [&_[data-sidebar=menu-sub-button]]:cursor-pointer"
    />
  )
}
