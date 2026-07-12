import type { ReactNode } from "react"

/**
 * Pass-through root layout. `AppProviders` lives in `app/[locale]/layout.tsx` under
 * `<html>` / `<body>` so client theme scripts are not mounted outside the document.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children
}
