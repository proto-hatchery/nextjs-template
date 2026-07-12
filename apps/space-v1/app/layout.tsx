import type { ReactNode } from "react"

/**
 * Pass-through root layout. `AppProviders` (incl. next-themes) must live inside
 * `app/[locale]/layout.tsx` `<html>` / `<body>` so theme scripts are not rendered
 * outside the document (hydration / "sync or defer script" errors).
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children
}
