"use client"

import * as React from "react"

import { useTheme } from "@workspace/core/components/theme-provider"

/**
 * Páginas institucionais: sempre modo claro no documento; restaura a preferência ao sair.
 * Se o utilizador tentar alternar (ex.: atalho global), volta a forçar claro enquanto esta árvore estiver montada.
 */
export function MarketingThemeLock({ children }: { children: React.ReactNode }) {
  const { setTheme, resolvedTheme } = useTheme()
  const savedRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    try {
      savedRef.current = localStorage.getItem("theme") ?? "system"
    } catch {
      savedRef.current = "system"
    }
    setTheme("light")
    return () => {
      const previous = savedRef.current
      if (previous) setTheme(previous)
    }
  }, [setTheme])

  React.useEffect(() => {
    if (resolvedTheme === "dark") {
      setTheme("light")
    }
  }, [resolvedTheme, setTheme])

  return <>{children}</>
}
