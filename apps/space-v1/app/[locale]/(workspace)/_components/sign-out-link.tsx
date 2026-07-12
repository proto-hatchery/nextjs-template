"use client"

import type { ComponentProps } from "react"

import { buildAuthLogoutUrl } from "@workspace/supabase-auth/shared/auth-redirect"

type SignOutLinkProps = Omit<ComponentProps<"a">, "href">

/**
 * Full navigation to the auth app's logout handler (cross-origin).
 * Uses a plain anchor so the browser performs a document navigation.
 */
export function SignOutLink({ children, ...props }: SignOutLinkProps) {
  return (
    <a href={buildAuthLogoutUrl()} {...props}>
      {children}
    </a>
  )
}
