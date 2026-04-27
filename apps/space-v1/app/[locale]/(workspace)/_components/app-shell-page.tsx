import type { ReactNode } from "react"

import { cn } from "@workspace/ui/lib/utils"

type AppShellPageProps = {
  children: ReactNode
  className?: string
}

export function AppShellPage({ children, className }: AppShellPageProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </div>
  )
}
