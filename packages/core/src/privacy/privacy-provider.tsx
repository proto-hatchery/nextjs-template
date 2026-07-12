"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import "./privacy.css"

type PrivacyModeContextValue = {
  isVisible: boolean
  toggle: () => void
  setVisible: (visible: boolean) => void
  isPending: boolean
}

const PrivacyModeContext = createContext<PrivacyModeContextValue | null>(null)

/**
 * PrivacyModeProvider - Workspace-wide privacy mode management.
 *
 * Features:
 * - LocalStorage persistence for cross-session memory
 * - Keyboard shortcut (Ctrl+Shift+H or Cmd+Shift+H)
 * - DOM attribute for CSS-only consumers
 * - Context for React components
 */
export function PrivacyModeProvider({
  children,
  defaultVisible = true,
}: {
  children: ReactNode
  defaultVisible?: boolean
}) {
  const [isVisible, setIsVisible] = useState(defaultVisible)
  const [isHydrated, setIsHydrated] = useState(false)

  const toggle = useCallback(() => {
    setIsVisible((prev) => {
      const newValue = !prev
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("privacy-mode-visible", String(newValue))
      }
      return newValue
    })
  }, [])

  const setVisible = useCallback((v: boolean) => {
    setIsVisible(v)
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("privacy-mode-visible", String(v))
    }
  }, [])

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem("privacy-mode-visible")
      if (stored !== null) {
        setIsVisible(stored === "true")
      }
    }
    setIsHydrated(true)
  }, [])

  // Reflect in DOM attribute for CSS-only consumers
  useEffect(() => {
    if (typeof document === "undefined") {
      return
    }
    const root = document.documentElement
    root.dataset.privacyMode = isVisible ? "visible" : "hidden"
  }, [isVisible])

  // Keyboard shortcut: Ctrl+Shift+H or Cmd+Shift+H
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "h") {
        e.preventDefault()
        toggle()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [toggle])

  const value = useMemo(
    () => ({
      isVisible,
      toggle,
      setVisible,
      isPending: !isHydrated,
    }),
    [isHydrated, isVisible, setVisible, toggle]
  )

  return (
    <PrivacyModeContext.Provider value={value}>
      {children}
    </PrivacyModeContext.Provider>
  )
}

export function usePrivacyMode() {
  const ctx = useContext(PrivacyModeContext)
  if (!ctx) {
    throw new Error("usePrivacyMode must be used within PrivacyModeProvider")
  }
  return ctx
}
