import type { Metadata } from "next"
import type { ReactNode } from "react"

/**
 * Auth HTTP handlers (`/logout`, `/callback`, `/auth/confirm`) live in this route
 * group so they stay separate from auth UI pages under `(auth)/`.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function AuthHandlersLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children
}
